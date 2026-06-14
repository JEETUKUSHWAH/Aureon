package com.fintech.FintechBackend.repository;

import com.fintech.FintechBackend.entity.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    Page<Invoice> findByCompanyId(UUID companyId, Pageable pageable);

    Optional<Invoice> findByIdAndCompanyId(UUID id, UUID companyId);

    boolean existsByInvoiceNumberAndCompanyId(String number, UUID companyId);

    @Query("SELECT i FROM Invoice i WHERE i.company.id=:cid AND i.status='SENT' AND i.dueDate<:today")
    List<Invoice> findOverdue(@Param("cid") UUID companyId, @Param("today") LocalDate today);
}
