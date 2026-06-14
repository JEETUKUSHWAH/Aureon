package com.fintech.FintechBackend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
@Entity
@Table(name = "expenses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expense {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitted_by")
    private TeamMember submittedBy;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id")
    private Transaction transaction;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_id")
    private VirtualCard card;
    private BigDecimal amount;
    @Builder.Default
    private String currency = "USD";
    @Column(name = "merchant_name")
    private String merchantName;
    private String category, description;
    @Column(name = "receipt_url")
    private String receiptUrl;
    @Builder.Default
    private Boolean reimbursable = false;
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ExpenseStatus status = ExpenseStatus.PENDING;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private TeamMember reviewedBy;
    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum ExpenseStatus {PENDING, APPROVED, REJECTED, REIMBURSED}
}
