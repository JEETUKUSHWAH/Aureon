package com.fintech.FintechBackend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "kyb_verifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KybVerification {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;
    private String ein;
    @Column(name = "legal_name")
    private String legalName;
    @Column(name = "business_type")
    private String businessType;
    @Column(name = "incorporation_state")
    private String incorporationState;
    @Column(name = "incorporation_date")
    private LocalDate incorporationDate;
    @Column(name = "doc_articles_url")
    private String docArticlesUrl;
    @Column(name = "doc_ein_letter_url")
    private String docEinLetterUrl;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "beneficial_owners", columnDefinition = "JSONB")
    private String beneficialOwners;
    @Column(name = "mock_reference")
    private String mockReference;
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private KybVerificationStatus status = KybVerificationStatus.PENDING;
    @Column(name = "rejection_reason")
    private String rejectionReason;
    @Column(name = "submitted_at")
    @Builder.Default
    private LocalDateTime submittedAt = LocalDateTime.now();
    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    public enum KybVerificationStatus {PENDING, UNDER_REVIEW, APPROVED, REJECTED, INFO_REQUIRED}
}
