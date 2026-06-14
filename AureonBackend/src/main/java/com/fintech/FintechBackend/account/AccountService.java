package com.fintech.FintechBackend.account;

import com.fintech.FintechBackend.entity.Account;
import com.fintech.FintechBackend.entity.TeamMember;
import com.fintech.FintechBackend.exception.NotFoundException;
import com.fintech.FintechBackend.repository.AccountRepository;
import com.fintech.FintechBackend.repository.TeamMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
class AccountService {
    private final AccountRepository accountRepo;
    private final TeamMemberRepository memberRepo;

    public List<Account> list(UUID companyId) {
        return accountRepo.findByCompanyId(companyId);
    }

    public Account get(UUID id, UUID companyId) {
        return accountRepo.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new NotFoundException("Account not found"));
    }

    @Transactional
    public Account create(CreateAccountRequest req, UUID companyId) {
        String acctNum = "ML" + System.currentTimeMillis() % 1_000_000_000L
                + String.format("%02d", ThreadLocalRandom.current().nextInt(100));
        Account account = Account.builder()
                .company(memberRepo.findByCompanyIdAndStatusNot(companyId, TeamMember.MemberStatus.REMOVED)
                        .get(0).getCompany())
                .accountNumber(acctNum).accountType(req.accountType())
                .currency("INR").nickname(req.nickname()).build();
        return accountRepo.save(account);
    }
}
