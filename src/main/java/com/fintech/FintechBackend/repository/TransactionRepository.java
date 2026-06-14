package com.fintech.FintechBackend.repository;

import com.fintech.FintechBackend.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID>, JpaSpecificationExecutor<Transaction> {
    @Query("""
            SELECT t FROM Transaction t WHERE t.company.id=:cid
            AND (:accountId IS NULL OR t.fromAccount.id=:accountId OR t.toAccount.id=:accountId)
            AND (:rail IS NULL OR t.paymentRail=:rail)
            AND (:status IS NULL OR t.status=:status)
            AND (:from IS NULL OR t.createdAt>=:from)
            AND (:to IS NULL OR t.createdAt<=:to)
            ORDER BY t.createdAt DESC""")
    Page<Transaction> search(@Param("cid") UUID companyId,
                             @Param("accountId") UUID accountId,
                             @Param("rail") Transaction.PaymentRail rail,
                             @Param("status") Transaction.TransactionStatus status,
                             @Param("from") LocalDateTime from,
                             @Param("to") LocalDateTime to,
                             Pageable pageable);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.company.id=:cid AND t.direction='DEBIT' AND t.status='COMPLETED' AND t.createdAt>:since")
    BigDecimal totalSpent(@Param("cid") UUID companyId, @Param("since") LocalDateTime since);
}
