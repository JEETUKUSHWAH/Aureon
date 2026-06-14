package com.fintech.FintechBackend.repository;

import com.fintech.FintechBackend.entity.ApprovalRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApprovalRequestRepository extends JpaRepository<ApprovalRequest, UUID> {
    List<ApprovalRequest> findByCompanyIdAndStatus(UUID companyId, ApprovalRequest.ApprovalStatus status);

    List<ApprovalRequest> findByCompanyIdAndRequestedByIdOrderByCreatedAtDesc(UUID companyId, UUID memberId);

    Optional<ApprovalRequest> findByTransactionIdAndStatus(UUID txId, ApprovalRequest.ApprovalStatus status);
}
