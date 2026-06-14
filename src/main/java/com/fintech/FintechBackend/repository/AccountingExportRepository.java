package com.fintech.FintechBackend.repository;

import com.fintech.FintechBackend.supportEntities.AccountingExport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AccountingExportRepository extends JpaRepository<AccountingExport, UUID> {
    List<AccountingExport> findByCompanyIdOrderByCreatedAtDesc(UUID companyId);
}
