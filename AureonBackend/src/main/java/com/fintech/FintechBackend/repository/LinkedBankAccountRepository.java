package com.fintech.FintechBackend.repository;

import com.fintech.FintechBackend.entity.LinkedBankAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LinkedBankAccountRepository extends JpaRepository<LinkedBankAccount, UUID> {

    List<LinkedBankAccount> findByCompanyIdAndStatusNot(UUID companyId, LinkedBankAccount.LinkStatus status);

    Optional<LinkedBankAccount> findByIdAndCompanyId(UUID id, UUID companyId);

    boolean existsByCompanyIdAndRoutingNumberAndExternalAccountNoAndStatusNot(
            UUID companyId, String routingNumber, String accountNo, LinkedBankAccount.LinkStatus status);
}
