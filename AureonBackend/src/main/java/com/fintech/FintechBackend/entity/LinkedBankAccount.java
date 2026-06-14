package com.fintech.FintechBackend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "linked_bank_accounts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LinkedBankAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id")
    private Account account;   // the platform account to receive funds

    @Column(name = "bank_name", nullable = false)
    private String bankName;

    @Column(name = "account_holder_name", nullable = false)
    private String accountHolderName;

    @Column(name = "routing_number", nullable = false)
    private String routingNumber;

    @Column(name = "external_account_no", nullable = false)
    private String externalAccountNo;

    @Column(name = "account_type")
    @Builder.Default
    private String accountType = "CHECKING";

    @Builder.Default
    private String currency = "USD";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private LinkStatus status = LinkStatus.PENDING;

    @Column(name = "micro_deposit_1")
    private BigDecimal microDeposit1;

    @Column(name = "micro_deposit_2")
    private BigDecimal microDeposit2;

    @Column(name = "micro_sent_at")
    private LocalDateTime microSentAt;

    @Column(name = "micro_expires_at")
    private LocalDateTime microExpiresAt;

    @Column(name = "verify_attempts")
    @Builder.Default
    private Integer verifyAttempts = 0;

    @Column(name = "max_attempts")
    @Builder.Default
    private Integer maxAttempts = 3;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "added_by")
    private TeamMember addedBy;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;


    public boolean isExpired() {
        return microExpiresAt != null && microExpiresAt.isBefore(LocalDateTime.now());
    }

    public boolean attemptsExhausted() {
        return verifyAttempts >= maxAttempts;
    }

    public String maskedAccountNo() {
        if (externalAccountNo == null || externalAccountNo.length() < 4) return "****";
        return "****" + externalAccountNo.substring(externalAccountNo.length() - 4);
    }

    public enum LinkStatus {
        PENDING,
        MICRO_SENT,
        AWAITING_VERIFY,
        VERIFIED,
        FAILED,
        REMOVED
    }
}
