package com.fintech.FintechBackend.operations;

import com.fintech.FintechBackend.entity.Account;
import com.fintech.FintechBackend.entity.TeamMember;
import com.fintech.FintechBackend.entity.VirtualCard;
import com.fintech.FintechBackend.exception.BadRequestException;
import com.fintech.FintechBackend.exception.ForbiddenException;
import com.fintech.FintechBackend.exception.NotFoundException;
import com.fintech.FintechBackend.repository.AccountRepository;
import com.fintech.FintechBackend.repository.TeamMemberRepository;
import com.fintech.FintechBackend.repository.VirtualCardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
class CardService {
    private final VirtualCardRepository cardRepo;
    private final AccountRepository accountRepo;
    private final TeamMemberRepository memberRepo;

    @Transactional
    public VirtualCard issueCard(IssueCardRequest req, UUID companyId) {
        Account account = accountRepo.findByIdAndCompanyId(req.accountId(), companyId)
                .orElseThrow(() -> new NotFoundException("Account not found"));
        TeamMember recipient = memberRepo.findById(req.issuedToMemberId())
                .orElseThrow(() -> new NotFoundException("Member not found"));
        if (!recipient.getCompany().getId().equals(companyId))
            throw new ForbiddenException("Member not in your company");

        // Generate mock Luhn-valid card number
        String cardNumber = generateCardNumber();
        String lastFour = cardNumber.substring(cardNumber.length() - 4);
        YearMonth expiry = YearMonth.now().plusYears(3);

        VirtualCard card = VirtualCard.builder()
                .company(account.getCompany()).account(account).issuedTo(recipient)
                .cardNumber("**** **** **** " + lastFour).lastFour(lastFour)
                .expiryMonth((short) expiry.getMonthValue()).expiryYear((short) expiry.getYear())
                .spendingLimit(req.spendingLimit()).limitPeriod(req.limitPeriod())
                .nickname(req.nickname())
                .build();

        return cardRepo.save(card);
    }

    public List<VirtualCard> listCards(UUID companyId) {
        return cardRepo.findByCompanyId(companyId);
    }

    public List<VirtualCard> myCards(UUID memberId) {
        return cardRepo.findByIssuedToId(memberId);
    }

    @Transactional
    public VirtualCard toggleFreeze(UUID cardId, UUID companyId, boolean freeze) {
        VirtualCard card = cardRepo.findByIdAndCompanyId(cardId, companyId)
                .orElseThrow(() -> new NotFoundException("Card not found"));
        if (card.getStatus() == VirtualCard.CardStatus.CANCELLED) throw new BadRequestException("Card is cancelled");
        card.setStatus(freeze ? VirtualCard.CardStatus.FROZEN : VirtualCard.CardStatus.ACTIVE);
        return cardRepo.save(card);
    }

    @Transactional
    public VirtualCard updateCard(UUID cardId, UUID companyId, UpdateCardRequest req) {
        VirtualCard card = cardRepo.findByIdAndCompanyId(cardId, companyId)
                .orElseThrow(() -> new NotFoundException("Card not found"));
        if (req.spendingLimit() != null) card.setSpendingLimit(req.spendingLimit());
        if (req.limitPeriod() != null) card.setLimitPeriod(req.limitPeriod());
        if (req.nickname() != null) card.setNickname(req.nickname());
        return cardRepo.save(card);
    }

    @Transactional
    public void cancelCard(UUID cardId, UUID companyId) {
        VirtualCard card = cardRepo.findByIdAndCompanyId(cardId, companyId)
                .orElseThrow(() -> new NotFoundException("Card not found"));
        card.setStatus(VirtualCard.CardStatus.CANCELLED);
        cardRepo.save(card);
    }

    private String generateCardNumber() {
        // Luhn-valid 16-digit Visa-prefix card number generator
        StringBuilder sb = new StringBuilder("4");
        Random rng = new Random();
        for (int i = 0; i < 14; i++) sb.append(rng.nextInt(10));
        int sum = 0;
        String partial = sb.toString();
        for (int i = 0; i < 15; i++) {
            int d = partial.charAt(i) - '0';
            if (i % 2 == 0) {
                d *= 2;
                if (d > 9) d -= 9;
            }
            sum += d;
        }
        sb.append((10 - (sum % 10)) % 10);
        return sb.toString();
    }
}
