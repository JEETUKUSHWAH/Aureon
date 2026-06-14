package com.fintech.FintechBackend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "invoices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id")
    private Account account;
    @Column(name = "invoice_number")
    private String invoiceNumber;
    @Column(name = "client_name")
    private String clientName;
    @Column(name = "client_email")
    private String clientEmail;
    @Column(name = "client_address")
    private String clientAddress;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "line_items", columnDefinition = "json")
    private List<LineItem> lineItems;;
    private BigDecimal subtotal;
    @Column(name = "tax_rate")
    @Builder.Default
    private BigDecimal taxRate = BigDecimal.ZERO;
    @Column(name = "tax_amount")
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;
    @Column(name = "total_amount")
    private BigDecimal totalAmount;
    @Builder.Default
    private String currency = "USD";
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private InvoiceStatus status = InvoiceStatus.DRAFT;
    @Column(name = "due_date")
    private LocalDate dueDate;
    @Column(name = "paid_at")
    private LocalDateTime paidAt;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id")
    private Transaction transaction;
    private String notes;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private TeamMember createdBy;
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum InvoiceStatus {DRAFT, SENT, VIEWED, PAID, OVERDUE, CANCELLED}
}
