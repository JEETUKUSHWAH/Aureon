package com.fintech.FintechBackend.payment;

import com.fintech.FintechBackend.entity.Account;
import com.fintech.FintechBackend.entity.ApprovalRequest;
import com.fintech.FintechBackend.entity.TeamMember;
import com.fintech.FintechBackend.entity.Transaction;
import com.fintech.FintechBackend.exception.BadRequestException;
import com.fintech.FintechBackend.exception.ForbiddenException;
import com.fintech.FintechBackend.exception.NotFoundException;
import com.fintech.FintechBackend.exception.UnprocessableException;
import com.fintech.FintechBackend.repository.*;
import com.fintech.FintechBackend.supportEntities.ApprovalPolicy;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final AccountRepository accountRepo;
    private final TransactionRepository txRepo;
    private final ApprovalRequestRepository approvalRepo;
    private final ApprovalPolicyRepository policyRepo;
    private final TeamMemberRepository memberRepo;
    private final EntityManager em;

    @Value("${app.fx.usd-to-inr:83.50}")
    private BigDecimal usdToInr;

    // ── Book Transfer (internal, free, instant) ──────────────────────────────

    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public Transaction bookTransfer(BookTransferRequest req, UUID companyId, UUID memberId) {
        if (req.fromAccountId().equals(req.toAccountId())) throw new BadRequestException("Cannot transfer to same account");

        Account from = lockAccount(req.fromAccountId(), companyId);
        Account to   = lockAccount(req.toAccountId(), companyId);

        validateBalance(from, req.amount());

        from.setBalance(from.getBalance().subtract(req.amount()));
        to.setBalance(to.getBalance().add(req.amount()));

        TeamMember initiator = memberRepo.getReferenceById(memberId);
        Transaction tx = Transaction.builder()
                .company(from.getCompany()).fromAccount(from).toAccount(to)
                .paymentRail(Transaction.PaymentRail.BOOK)
                .direction(Transaction.Direction.DEBIT)
                .amount(req.amount()).currency(from.getCurrency())
                .amountUsd(req.amount()).fxRate(BigDecimal.ONE)
                .status(Transaction.TransactionStatus.COMPLETED)
                .description("Book transfer").memo(req.memo())
                .initiatedBy(initiator).settledAt(LocalDateTime.now())
                .build();

        log.info("Book transfer: {} -> {} amount={}", req.fromAccountId(), req.toAccountId(), req.amount());
        return txRepo.save(tx);
    }

    // ── UPI Payment (India instant transfer) ──────────────────────────────────

    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public Transaction initiateUpi(UpiRequest req, UUID companyId, UUID memberId) {
        Account account = lockAccount(req.fromAccountId(), companyId);
        BigDecimal fee  = BigDecimal.ZERO;  // UPI is free for businesses < ₹2000
        validateBalance(account, req.amount());

        // Convert USD to INR if account is in USD
        BigDecimal amountInr;
        BigDecimal fxRate = BigDecimal.ONE;
        if (account.getCurrency().equals("USD")) {
            fxRate = usdToInr;
            amountInr = req.amount().multiply(fxRate);
        } else {
            amountInr = req.amount();
        }

        TeamMember initiator = memberRepo.getReferenceById(memberId);
        account.setBalance(account.getBalance().subtract(req.amount()));

        boolean needsApproval = checkApprovalPolicy(companyId, req.amount(), "UPI");

        Transaction tx = Transaction.builder()
                .company(account.getCompany()).fromAccount(account)
                .paymentRail(Transaction.PaymentRail.UPI)
                .direction(Transaction.Direction.DEBIT)
                .amount(amountInr).currency("INR")
                .amountUsd(account.getCurrency().equals("USD") ? req.amount() : req.amount().divide(usdToInr, 2, RoundingMode.HALF_UP))
                .fxRate(fxRate).fee(fee)
                .status(needsApproval ? Transaction.TransactionStatus.PENDING : Transaction.TransactionStatus.PROCESSING)
                .counterpartyName(req.counterpartyName()).counterpartyAcct(req.upiId())
                .description("UPI payment to " + req.upiId())
                .memo(req.memo()).category(req.category())
                .approvalRequired(needsApproval).initiatedBy(initiator)
                .scheduledAt(LocalDateTime.now())  // instant — settles in seconds
                .build();
        tx = txRepo.save(tx);

        if (needsApproval) createApprovalRequest(tx, req.amount(), companyId, memberId, "UPI");

        log.info("UPI payment initiated: from={} to={} amount={}", account.getId(), req.upiId(), req.amount());
        return tx;
    }

    // ── NEFT Payment (India bank transfer, settles in 2 hours) ────────────────

    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public Transaction initiateNeft(NeftRequest req, UUID companyId, UUID memberId) {
        Account account = lockAccount(req.fromAccountId(), companyId);
        BigDecimal fee  = new BigDecimal("2.50");  // ₹2.50 NEFT fee (₹10k-₹1L slab)
        validateBalance(account, req.amount().add(fee));

        // Convert USD to INR if needed
        BigDecimal amountInr;
        BigDecimal fxRate = BigDecimal.ONE;
        if (account.getCurrency().equals("USD")) {
            fxRate = usdToInr;
            amountInr = req.amount().multiply(fxRate);
        } else {
            amountInr = req.amount();
        }

        TeamMember initiator = memberRepo.getReferenceById(memberId);
        account.setBalance(account.getBalance().subtract(req.amount()).subtract(fee));

        boolean needsApproval = checkApprovalPolicy(companyId, req.amount(), "NEFT");

        Transaction tx = Transaction.builder()
                .company(account.getCompany()).fromAccount(account)
                .paymentRail(Transaction.PaymentRail.NEFT)
                .direction(Transaction.Direction.DEBIT)
                .amount(amountInr).currency("INR")
                .amountUsd(account.getCurrency().equals("USD") ? req.amount() : req.amount().divide(usdToInr, 2, RoundingMode.HALF_UP))
                .fxRate(fxRate).fee(fee)
                .status(needsApproval ? Transaction.TransactionStatus.PENDING : Transaction.TransactionStatus.PROCESSING)
                .counterpartyName(req.counterpartyName())
                .counterpartyAcct(req.counterpartyAccount())
                .counterpartyRouting(req.ifscCode())
                .description("NEFT transfer to " + req.counterpartyName())
                .memo(req.memo()).category(req.category())
                .approvalRequired(needsApproval).initiatedBy(initiator)
                .scheduledAt(LocalDateTime.now().plusHours(2))  // NEFT settles in 2 hours
                .build();
        tx = txRepo.save(tx);

        if (needsApproval) createApprovalRequest(tx, req.amount(), companyId, memberId, "NEFT");

        log.info("NEFT payment initiated: from={} to={} amount={}", account.getId(), req.counterpartyAccount(), req.amount());
        return tx;
    }

    // ── ACH Payment ──────────────────────────────────────────────────────────

    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public Transaction initiateAch(AchRequest req, UUID companyId, UUID memberId) {
        Account account = lockAccount(req.fromAccountId(), companyId);
        validateBalance(account, req.amount());

        boolean needsApproval = checkApprovalPolicy(companyId, req.amount(), "ACH");
        TeamMember initiator = memberRepo.getReferenceById(memberId);

        account.setBalance(account.getBalance().subtract(req.amount()));

        Transaction tx = Transaction.builder()
                .company(account.getCompany()).fromAccount(account)
                .paymentRail(Transaction.PaymentRail.ACH)
                .direction(Transaction.Direction.DEBIT)
                .amount(req.amount()).currency("USD").amountUsd(req.amount()).fxRate(BigDecimal.ONE)
                .status(needsApproval ? Transaction.TransactionStatus.PENDING : Transaction.TransactionStatus.PROCESSING)
                .counterpartyName(req.counterpartyName())
                .counterpartyAcct(req.counterpartyAccount())
                .counterpartyRouting(req.counterpartyRouting())
                .memo(req.memo()).category(req.category())
                .description(req.sameDay() ? "ACH Same-Day" : "ACH Standard (3 days)")
                .approvalRequired(needsApproval).initiatedBy(initiator)
                .scheduledAt(req.sameDay()
                        ? LocalDateTime.now().plusHours(2)
                        : LocalDateTime.now().plusDays(3))
                .build();
        tx = txRepo.save(tx);

        if (needsApproval) createApprovalRequest(tx, req.amount(), companyId, memberId, "ACH");

        log.info("ACH initiated: {} to={} amount={} sameDay={} approval={}",
                tx.getId(), req.counterpartyName(), req.amount(), req.sameDay(), needsApproval);
        return tx;
    }

    // ── Wire Transfer ─────────────────────────────────────────────────────────

    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public Transaction initiateWire(WireRequest req, UUID companyId, UUID memberId) {
        Account account = lockAccount(req.fromAccountId(), companyId);

        // Wires have a flat fee of $0 for Mercury-style (free domestic wires)
        validateBalance(account, req.amount());

        boolean needsApproval = checkApprovalPolicy(companyId, req.amount(), "WIRE");
        TeamMember initiator = memberRepo.getReferenceById(memberId);

        account.setBalance(account.getBalance().subtract(req.amount()));

        Transaction tx = Transaction.builder()
                .company(account.getCompany()).fromAccount(account)
                .paymentRail(Transaction.PaymentRail.WIRE)
                .direction(Transaction.Direction.DEBIT)
                .amount(req.amount()).currency("USD").amountUsd(req.amount()).fxRate(BigDecimal.ONE)
                .fee(BigDecimal.ZERO)
                .status(needsApproval ? Transaction.TransactionStatus.PENDING : Transaction.TransactionStatus.PROCESSING)
                .counterpartyName(req.counterpartyName()).counterpartyAcct(req.counterpartyAccount())
                .counterpartyRouting(req.counterpartyRouting())
                .memo(req.memo()).description("Domestic wire transfer")
                .approvalRequired(needsApproval).initiatedBy(initiator)
                .scheduledAt(LocalDateTime.now().plusHours(4))  // same-day if before cutoff
                .build();
        tx = txRepo.save(tx);

        if (needsApproval) createApprovalRequest(tx, req.amount(), companyId, memberId, "WIRE");
        return tx;
    }

    // ── International Payment (USD → INR) ─────────────────────────────────────

    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public Transaction initiateInternational(InternationalRequest req, UUID companyId, UUID memberId) {
        Account account = lockAccount(req.fromAccountId(), companyId);

        // Determine FX rate and debit amount in USD
        BigDecimal fxRate;
        BigDecimal debitAmountUsd;
        BigDecimal receivedAmount;

        if (req.targetCurrency().equals("USD")) {
            fxRate = BigDecimal.ONE;
            debitAmountUsd = req.amount();
            receivedAmount = req.amount();
        } else {
            // USD → INR
            fxRate = usdToInr;
            debitAmountUsd = req.amount();                              // amount is in USD
            receivedAmount = req.amount().multiply(fxRate).setScale(2, RoundingMode.HALF_UP); // INR received
        }

        // International wire fee: $5 flat (mock)
        BigDecimal fee = new BigDecimal("5.00");
        validateBalance(account, debitAmountUsd.add(fee));

        boolean needsApproval = checkApprovalPolicy(companyId, debitAmountUsd, "INTERNATIONAL");
        TeamMember initiator = memberRepo.getReferenceById(memberId);

        account.setBalance(account.getBalance().subtract(debitAmountUsd).subtract(fee));

        Transaction tx = Transaction.builder()
                .company(account.getCompany()).fromAccount(account)
                .paymentRail(Transaction.PaymentRail.INTERNATIONAL)
                .direction(Transaction.Direction.DEBIT)
                .amount(receivedAmount).currency(req.targetCurrency())
                .fxRate(fxRate).amountUsd(debitAmountUsd).fee(fee)
                .status(needsApproval ? Transaction.TransactionStatus.PENDING : Transaction.TransactionStatus.PROCESSING)
                .counterpartyName(req.counterpartyName()).counterpartyAcct(req.counterpartyAccount())
                .memo(req.memo())
                .description(String.format("International payment: %s %s @ %s", receivedAmount, req.targetCurrency(), fxRate))
                .approvalRequired(needsApproval).initiatedBy(initiator)
                .scheduledAt(LocalDateTime.now().plusDays(2))
                .build();
        tx = txRepo.save(tx);

        if (needsApproval) createApprovalRequest(tx, debitAmountUsd, companyId, memberId, "INTERNATIONAL");
        return tx;
    }

    // ── Check Mailing ─────────────────────────────────────────────────────────

    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public Transaction mailCheck(CheckRequest req, UUID companyId, UUID memberId) {
        Account account = lockAccount(req.fromAccountId(), companyId);
        BigDecimal fee = new BigDecimal("1.00"); // $1 check mailing fee
        validateBalance(account, req.amount().add(fee));

        TeamMember initiator = memberRepo.getReferenceById(memberId);
        account.setBalance(account.getBalance().subtract(req.amount()).subtract(fee));

        Transaction tx = Transaction.builder()
                .company(account.getCompany()).fromAccount(account)
                .paymentRail(Transaction.PaymentRail.CHECK)
                .direction(Transaction.Direction.DEBIT)
                .amount(req.amount()).currency("USD").amountUsd(req.amount()).fee(fee)
                .status(Transaction.TransactionStatus.PROCESSING)
                .counterpartyName(req.payeeName()).memo(req.memo())
                .description("Check mailed to: " + req.mailingAddress())
                .initiatedBy(initiator)
                .scheduledAt(LocalDateTime.now().plusDays(5)) // 3-5 business days
                .build();
        return txRepo.save(tx);
    }

    // ── Approval workflow ──────────────────────────────────────────────────────

    @Transactional
    public ApprovalRequest resolveApproval(UUID requestId, ApprovalActionRequest action,
                                           UUID companyId, UUID actorId) {
        ApprovalRequest req = approvalRepo.findById(requestId)
                .orElseThrow(() -> new NotFoundException("Approval request not found"));

        if (!req.getCompany().getId().equals(companyId)) throw new ForbiddenException("Not your company");
        if (req.getStatus() != ApprovalRequest.ApprovalStatus.PENDING)
            throw new BadRequestException("Already resolved");

        TeamMember actor = memberRepo.findById(actorId).orElseThrow();
        if (!actor.canApprove()) throw new ForbiddenException("You don't have approval permissions");

        boolean approved = "APPROVE".equals(action.action());
        req.setStatus(approved ? ApprovalRequest.ApprovalStatus.APPROVED : ApprovalRequest.ApprovalStatus.REJECTED);
        req.setApprovedBy(actor);
        req.setNotes(action.notes());
        req.setResolvedAt(LocalDateTime.now());
        approvalRepo.save(req);

        // Update the pending transaction
        if (req.getTransaction() != null) {
            Transaction tx = req.getTransaction();
            tx.setStatus(approved ? Transaction.TransactionStatus.PROCESSING : Transaction.TransactionStatus.CANCELLED);
            tx.setApprovedBy(actor);
            if (!approved) {
                // Refund the held amount back
                if (tx.getFromAccount() != null) {
                    Account acc = accountRepo.findById(tx.getFromAccount().getId()).orElseThrow();
                    acc.setBalance(acc.getBalance().add(tx.getAmountUsd() != null ? tx.getAmountUsd() : tx.getAmount()).add(tx.getFee()));
                    accountRepo.save(acc);
                }
            }
            txRepo.save(tx);
        }

        log.info("Approval {} by {} for request {}", action.action(), actorId, requestId);
        return req;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Account lockAccount(UUID accountId, UUID companyId) {
        Account account = em.find(com.fintech.FintechBackend.entity.Account.class, accountId, LockModeType.PESSIMISTIC_WRITE);
        if (account == null) throw new NotFoundException("Account not found");
        if (!account.getCompany().getId().equals(companyId)) throw new ForbiddenException("Not your account");
        if (account.getStatus() != Account.AccountStatus.ACTIVE) throw new BadRequestException("Account is not active");
        return account;
    }

    private void validateBalance(Account account, BigDecimal amount) {
        if (account.getBalance().compareTo(amount) < 0) throw new UnprocessableException("Insufficient balance");
    }

    private boolean checkApprovalPolicy(UUID companyId, BigDecimal amount, String rail) {
        return !policyRepo.findMatchingPoliciesForRail(companyId, amount, rail).isEmpty();
    }

    private void createApprovalRequest(Transaction tx, BigDecimal amount,
                                       UUID companyId, UUID memberId, String rail) {
        List<ApprovalPolicy> policies = policyRepo.findMatchingPoliciesForRail(companyId, amount, rail);
        if (policies.isEmpty()) return;

        ApprovalPolicy policy = policies.get(0);
        ApprovalRequest ar = ApprovalRequest.builder()
                .company(tx.getCompany()).transaction(tx)
                .requestedBy(memberRepo.getReferenceById(memberId))
                .amount(amount).policyName(policy.getName())
                .expiresAt(LocalDateTime.now().plusHours(24))
                .build();
        approvalRepo.save(ar);
    }

    // ── Queries ───────────────────────────────────────────────────────────────

    public Page<Transaction> listTransactions(UUID companyId, int page, int size,
                                              String status, String rail) {
        Pageable pageable = PageRequest.of(page, size);
        Transaction.TransactionStatus s = status != null ? Transaction.TransactionStatus.valueOf(status) : null;
        Transaction.PaymentRail r       = rail != null   ? Transaction.PaymentRail.valueOf(rail) : null;
        return txRepo.findAll(
                TransactionSpecification.filter(companyId, null, r, s, null, null),
                pageable
        );
    }

    public List<ApprovalRequest> pendingApprovals(UUID companyId) {
        return approvalRepo.findByCompanyIdAndStatus(companyId, ApprovalRequest.ApprovalStatus.PENDING);
    }

    public BigDecimal getCurrentFxRate(String from, String to) {
        if (from.equals("USD") && to.equals("INR")) return usdToInr;
        if (from.equals("INR") && to.equals("USD")) return BigDecimal.ONE.divide(usdToInr, 6, RoundingMode.HALF_UP);
        return BigDecimal.ONE;
    }
}
