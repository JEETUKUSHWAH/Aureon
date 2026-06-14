package com.fintech.FintechBackend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "approval_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id")
    private Transaction transaction;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by")
    private TeamMember requestedBy;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private TeamMember approvedBy;
    @Column(name = "policy_name")
    private String policyName;
    private BigDecimal amount;
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ApprovalStatus status = ApprovalStatus.PENDING;
    private String notes;
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    public enum ApprovalStatus {PENDING, APPROVED, REJECTED, EXPIRED}
}
