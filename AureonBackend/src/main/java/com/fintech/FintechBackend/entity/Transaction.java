package com.fintech.FintechBackend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_account_id")
    private Account fromAccount;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_account_id")
    private Account toAccount;
    @Column(name = "payment_rail")
    @Enumerated(EnumType.STRING)
    private PaymentRail paymentRail;
    @Enumerated(EnumType.STRING)
    private Direction direction;
    private BigDecimal amount;
    @Builder.Default
    private String currency = "USD";
    @Column(name = "fx_rate")
    @Builder.Default
    private BigDecimal fxRate = BigDecimal.ONE;
    @Column(name = "amount_usd")
    private BigDecimal amountUsd;
    @Builder.Default
    private BigDecimal fee = BigDecimal.ZERO;
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TransactionStatus status = TransactionStatus.PENDING;
    private String description, reference, memo, category;
    @Column(name = "counterparty_name")
    private String counterpartyName;
    @Column(name = "counterparty_acct")
    private String counterpartyAcct;
    @Column(name = "counterparty_routing")
    private String counterpartyRouting;
    @Column(name = "approval_required")
    @Builder.Default
    private Boolean approvalRequired = false;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private TeamMember approvedBy;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "initiated_by")
    private TeamMember initiatedBy;
    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;
    @Column(name = "settled_at")
    private LocalDateTime settledAt;
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum PaymentRail { ACH, WIRE, INTERNATIONAL, CHECK, BOOK, CARD, FEE, UPI, NEFT }

    public enum Direction {DEBIT, CREDIT}

    public enum TransactionStatus {PENDING, PROCESSING, COMPLETED, FAILED, REVERSED, CANCELLED}
}
