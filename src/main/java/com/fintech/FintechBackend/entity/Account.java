package com.fintech.FintechBackend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;
    @Column(name = "account_number", unique = true)
    private String accountNumber;
    @Column(name = "routing_number")
    @Builder.Default
    private String routingNumber = "021000021";
    @Column(name = "account_type")
    @Enumerated(EnumType.STRING)
    private AccountType accountType;
    @Builder.Default
    private String currency = "USD";
    @Builder.Default
    private BigDecimal balance = BigDecimal.ZERO;
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AccountStatus status = AccountStatus.ACTIVE;
    private String nickname;
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum AccountType {CHECKING, SAVINGS}

    public enum AccountStatus {ACTIVE, FROZEN, CLOSED}
}
