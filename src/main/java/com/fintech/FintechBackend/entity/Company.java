package com.fintech.FintechBackend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "legal_name", nullable = false)
    private String legalName;
    @Column(name = "display_name")
    private String displayName;
    private String ein;
    @Column(name = "business_type")
    @Enumerated(EnumType.STRING)
    private BusinessType businessType;
    private String industry;
    private String website, phone;
    @Column(name = "address_line1")
    private String addressLine1;
    @Column(name = "address_line2")
    private String addressLine2;
    private String city, state;
    @Column(length = 2)
    @Builder.Default
    private String country = "IN";
    @Column(name = "postal_code")
    private String postalCode;
    @Column(name = "kyb_status", nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private KybStatus kybStatus = KybStatus.PENDING;
    @Column(name = "kyb_reference")
    private String kybReference;
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private CompanyStatus status = CompanyStatus.ONBOARDING;
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    @UpdateTimestamp
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
    @Column(name = "remembers_me")
    private Boolean rememberMe ;

    public enum BusinessType {LLC, C_CORP, S_CORP, SOLE_PROP, PARTNERSHIP, NON_PROFIT}

    public enum KybStatus {PENDING, UNDER_REVIEW, APPROVED, REJECTED, INFO_REQUIRED}

    public enum CompanyStatus {ONBOARDING, ACTIVE, SUSPENDED, CLOSED}

}
