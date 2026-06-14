package com.fintech.FintechBackend.repository;

import com.fintech.FintechBackend.entity.Expense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, UUID> {
    Page<Expense> findByCompanyId(UUID companyId, Pageable pageable);

    List<Expense> findByCompanyIdAndStatus(UUID companyId, Expense.ExpenseStatus status);

    Optional<Expense> findByIdAndCompanyId(UUID id, UUID companyId);
}
