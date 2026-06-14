package com.fintech.FintechBackend.repository;

import com.fintech.FintechBackend.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AccountRepository extends JpaRepository<Account, UUID> {
    List<Account> findByCompanyIdAndStatus(UUID companyId, Account.AccountStatus status);

    List<Account> findByCompanyId(UUID companyId);

    Optional<Account> findByIdAndCompanyId(UUID id, UUID companyId);
}
