package com.fintech.FintechBackend.repository;

import com.fintech.FintechBackend.supportEntities.ApprovalPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface ApprovalPolicyRepository extends JpaRepository<ApprovalPolicy, UUID> {
    List<ApprovalPolicy> findByCompanyIdAndActiveTrue(UUID companyId);

    @Query("SELECT p FROM ApprovalPolicy p WHERE p.company.id=:cid AND p.active=true " +
            "AND p.amountAbove<:amount AND (p.paymentRail IS NULL OR p.paymentRail=:rail) " +
            "ORDER BY p.amountAbove DESC")
    List<ApprovalPolicy> findMatchingPoliciesForRail(
            @Param("cid") UUID companyId,
            @Param("amount") BigDecimal amount,
            @Param("rail") String rail);

    @Query("SELECT p FROM ApprovalPolicy p WHERE p.company.id=:cid AND p.active=true " +
            "AND p.amountAbove<:amount ORDER BY p.amountAbove DESC")
    List<ApprovalPolicy> findMatchingPoliciesAnyRail(
            @Param("cid") UUID companyId,
            @Param("amount") BigDecimal amount);

}
