package com.fintech.FintechBackend.linkedaccounts;

import com.fintech.FintechBackend.entity.*;
import com.fintech.FintechBackend.exception.BadRequestException;
import com.fintech.FintechBackend.exception.ConflictException;
import com.fintech.FintechBackend.exception.NotFoundException;
import com.fintech.FintechBackend.repository.AccountRepository;
import com.fintech.FintechBackend.repository.LinkedBankAccountRepository;
import com.fintech.FintechBackend.repository.TeamMemberRepository;
import com.fintech.FintechBackend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@Slf4j
class LinkedBankAccountService {

    final LinkedBankAccountRepository linkedRepo;
    private final AccountRepository accountRepo;
    private final TeamMemberRepository memberRepo;
    private final TransactionRepository txRepo;

    /**
     * Step 1: Company submits their external bank details.
     * We save the record and asynchronously dispatch two mock micro-deposits.
     */
    @Transactional
    public LinkedAccountResponse linkAccount(LinkAccountRequest req, UUID companyId, UUID memberId) {

        // Prevent duplicate — same routing + account already linked for this company
        boolean duplicate = linkedRepo.existsByCompanyIdAndRoutingNumberAndExternalAccountNoAndStatusNot(
                companyId, req.routingNumber(), req.externalAccountNo(), LinkedBankAccount.LinkStatus.REMOVED);
        if (duplicate) {
            throw new ConflictException("This bank account is already linked to your company");
        }

        // Validate the platform account belongs to this company
        Account platformAccount = accountRepo.findByIdAndCompanyId(req.platformAccountId(), companyId)
                .orElseThrow(() -> new NotFoundException("Platform account not found"));

        TeamMember member = memberRepo.findById(memberId).orElseThrow();
        Company company = member.getCompany();

        LinkedBankAccount linked = LinkedBankAccount.builder()
                .company(company)
                .account(platformAccount)
                .bankName(req.bankName())
                .accountHolderName(req.accountHolderName())
                .routingNumber(req.routingNumber())
                .externalAccountNo(req.externalAccountNo())
                .accountType(req.accountType())
                .currency("USD")
                .addedBy(member)
                .build();

        linked = linkedRepo.save(linked);

        // Trigger async micro-deposit dispatch
        dispatchMicroDeposits(linked.getId());

        log.info("Bank account linked: company={} linkedId={} bank={}",
                companyId, linked.getId(), req.bankName());

        return toResponse(linked);
    }

    /**
     * Simulates sending two small ACH credits to the external bank.
     * In production, this calls your ACH processor (Dwolla / Column).
     * Here: generates two random amounts, stores them, flips status to AWAITING_VERIFY.
     */
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void dispatchMicroDeposits(UUID linkedId) {
        try {
            Thread.sleep(1500); // simulate ACH dispatch latency

            linkedRepo.findById(linkedId).ifPresent(linked -> {

                // Generate two distinct random amounts between $0.01 and $0.99
                BigDecimal d1 = randomCents();
                BigDecimal d2;
                do {
                    d2 = randomCents();
                } while (d2.equals(d1));

                linked.setMicroDeposit1(d1);
                linked.setMicroDeposit2(d2);
                linked.setStatus(LinkedBankAccount.LinkStatus.AWAITING_VERIFY);
                linked.setMicroSentAt(LocalDateTime.now());
                linked.setMicroExpiresAt(LocalDateTime.now().plusDays(3));

                linkedRepo.save(linked);

                log.info("Mock micro-deposits dispatched: linkedId={} amounts=${} ${}",
                        linkedId, d1, d2);

                // In real system: send email to company owner:
                // "Two small deposits will appear in your [bankName] account within 1-3 days.
                //  Check your statement and enter the amounts to verify ownership."
            });

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    /**
     * Step 2: Company checks their external bank statement and enters
     * the two micro-deposit amounts to prove they own the account.
     */
    @Transactional
    public LinkedAccountResponse verify(UUID linkedId, VerifyRequest req,
                                        UUID companyId, UUID memberId) {

        LinkedBankAccount linked = linkedRepo.findByIdAndCompanyId(linkedId, companyId)
                .orElseThrow(() -> new NotFoundException("Linked account not found"));

        // Status guards
        if (linked.getStatus() == LinkedBankAccount.LinkStatus.VERIFIED) {
            throw new BadRequestException("Account is already verified");
        }
        if (linked.getStatus() == LinkedBankAccount.LinkStatus.FAILED) {
            throw new BadRequestException("Verification failed. Please remove and re-add this account.");
        }
        if (linked.getStatus() == LinkedBankAccount.LinkStatus.PENDING
                || linked.getStatus() == LinkedBankAccount.LinkStatus.MICRO_SENT) {
            throw new BadRequestException("Micro-deposits not yet dispatched. Please wait 1-2 minutes.");
        }
        if (linked.isExpired()) {
            linked.setStatus(LinkedBankAccount.LinkStatus.FAILED);
            linkedRepo.save(linked);
            throw new BadRequestException("Verification window expired. Please remove and re-add this account.");
        }
        if (linked.attemptsExhausted()) {
            linked.setStatus(LinkedBankAccount.LinkStatus.FAILED);
            linkedRepo.save(linked);
            throw new BadRequestException("Maximum verification attempts exceeded.");
        }

        // Increment attempt counter first (so a crash doesn't let someone retry infinitely)
        linked.setVerifyAttempts(linked.getVerifyAttempts() + 1);

        // Compare the two amounts (order-insensitive)
        boolean match = amountsMatch(req.amount1(), req.amount2(),
                linked.getMicroDeposit1(), linked.getMicroDeposit2());

        if (!match) {
            int remaining = linked.getMaxAttempts() - linked.getVerifyAttempts();
            if (remaining <= 0) {
                linked.setStatus(LinkedBankAccount.LinkStatus.FAILED);
                linkedRepo.save(linked);
                throw new BadRequestException("Incorrect amounts. Account locked after maximum attempts.");
            }
            linkedRepo.save(linked);
            throw new BadRequestException(
                    "Incorrect amounts. You have " + remaining + " attempt(s) remaining.");
        }

        // Success — mark verified
        linked.setStatus(LinkedBankAccount.LinkStatus.VERIFIED);
        linked.setVerifiedAt(LocalDateTime.now());
        // Clear stored amounts after successful verification (security hygiene)
        linked.setMicroDeposit1(null);
        linked.setMicroDeposit2(null);
        linkedRepo.save(linked);

        log.info("Bank account VERIFIED: company={} linkedId={}", companyId, linkedId);
        return toResponse(linked);
    }

    /**
     * Step 3: Pull funds from the verified external account into the platform account.
     * This is a mock ACH pull — in production it calls your ACH processor.
     */
    @Transactional
    public Transaction fundFromLinkedAccount(UUID linkedId, FundRequest req,
                                             UUID companyId, UUID memberId) {

        LinkedBankAccount linked = linkedRepo.findByIdAndCompanyId(linkedId, companyId)
                .orElseThrow(() -> new NotFoundException("Linked account not found"));

        if (linked.getStatus() != LinkedBankAccount.LinkStatus.VERIFIED) {
            throw new BadRequestException("Account must be VERIFIED before funding. Status: " + linked.getStatus());
        }

        Account platformAccount = linked.getAccount();
        if (platformAccount == null) {
            throw new BadRequestException("No platform account associated with this linked account");
        }
        if (platformAccount.getStatus() != Account.AccountStatus.ACTIVE) {
            throw new BadRequestException("Platform account is not active");
        }

        TeamMember initiator = memberRepo.getReferenceById(memberId);

        // Credit the platform account balance
        platformAccount.setBalance(platformAccount.getBalance().add(req.amount()));
        accountRepo.save(platformAccount);

        // Record the transaction
        String reference = "FUND-" + System.currentTimeMillis();
        Transaction tx = Transaction.builder()
                .company(platformAccount.getCompany())
                .toAccount(platformAccount)
                .paymentRail(Transaction.PaymentRail.ACH)
                .direction(Transaction.Direction.CREDIT)
                .amount(req.amount())
                .currency("USD")
                .amountUsd(req.amount())
                .fxRate(BigDecimal.ONE)
                .fee(BigDecimal.ZERO)
                .status(Transaction.TransactionStatus.COMPLETED)
                .counterpartyName(linked.getAccountHolderName())
                .counterpartyAcct(linked.maskedAccountNo())
                .counterpartyRouting(linked.getRoutingNumber())
                .description("ACH pull from linked account: " + linked.getBankName())
                .memo(req.memo())
                .reference(reference)
                .initiatedBy(initiator)
                .settledAt(LocalDateTime.now())
                .build();

        tx = txRepo.save(tx);

        log.info("Funded platform account: company={} amount={} from={}",
                companyId, req.amount(), linked.getBankName());

        return tx;
    }

    public List<LinkedAccountResponse> listLinkedAccounts(UUID companyId) {
        return linkedRepo.findByCompanyIdAndStatusNot(companyId, LinkedBankAccount.LinkStatus.REMOVED)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public void removeLinkedAccount(UUID linkedId, UUID companyId) {
        LinkedBankAccount linked = linkedRepo.findByIdAndCompanyId(linkedId, companyId)
                .orElseThrow(() -> new NotFoundException("Linked account not found"));
        linked.setStatus(LinkedBankAccount.LinkStatus.REMOVED);
        linkedRepo.save(linked);
        log.info("Linked account removed: {}", linkedId);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private BigDecimal randomCents() {
        int cents = ThreadLocalRandom.current().nextInt(1, 100); // 1–99 cents
        return BigDecimal.valueOf(cents).divide(BigDecimal.valueOf(100), 2, RoundingMode.UNNECESSARY);
    }

    private boolean amountsMatch(BigDecimal a1, BigDecimal a2, BigDecimal d1, BigDecimal d2) {
        if (d1 == null || d2 == null) return false;
        // Order-insensitive: [a1=d1 AND a2=d2] OR [a1=d2 AND a2=d1]
        boolean directMatch = d1.compareTo(a1) == 0 && d2.compareTo(a2) == 0;
        boolean reverseMatch = d1.compareTo(a2) == 0 && d2.compareTo(a1) == 0;
        return directMatch || reverseMatch;
    }

    private LinkedAccountResponse toResponse(LinkedBankAccount l) {
        int attemptsRemaining = Math.max(0, l.getMaxAttempts() - l.getVerifyAttempts());
        return new LinkedAccountResponse(
                l.getId(), l.getBankName(), l.getAccountHolderName(),
                l.getRoutingNumber(), l.maskedAccountNo(),
                l.getAccountType(), l.getCurrency(), l.getStatus().name(),
                attemptsRemaining, l.getMicroExpiresAt(),
                l.getVerifiedAt(), l.getCreatedAt()
        );
    }
}
