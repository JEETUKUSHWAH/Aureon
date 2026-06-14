package com.fintech.FintechBackend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity @Table(name = "virtual_cards")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VirtualCard {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "company_id") private Company company;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "account_id") private Account account;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "issued_to") private TeamMember issuedTo;
    @Column(name = "card_number") private String cardNumber;
    @Column(name = "last_four", length = 4) private String lastFour;
    @Column(name = "expiry_month") private Short expiryMonth;
    @Column(name = "expiry_year") private Short expiryYear;
    @Column(name = "card_type") @Builder.Default private String cardType = "VIRTUAL";
    @Enumerated(EnumType.STRING) @Builder.Default private CardStatus status = CardStatus.ACTIVE;
    @Column(name = "spending_limit") private BigDecimal spendingLimit;
    @Column(name = "limit_period") private String limitPeriod;
    @Column(name = "spent_amount") @Builder.Default private BigDecimal spentAmount = BigDecimal.ZERO;
    @JdbcTypeCode(SqlTypes.JSON) @Column(name = "allowed_categories", columnDefinition = "JSONB") private String allowedCategories;
    private String nickname;
    @CreationTimestamp @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @UpdateTimestamp @Column(name = "updated_at") private LocalDateTime updatedAt;

    public enum CardStatus { ACTIVE, FROZEN, CANCELLED }
}

