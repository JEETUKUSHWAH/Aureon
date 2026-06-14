package com.fintech.FintechBackend.supportEntities;

import com.fintech.FintechBackend.entity.Company;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity @Table(name = "approval_policies")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApprovalPolicy {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "company_id") private Company company;
    @Column(nullable = false) private String name;
    @Column(name = "payment_rail") private String paymentRail;
    @Column(name = "amount_above") @Builder.Default private BigDecimal amountAbove = BigDecimal.ZERO;
    @Column(name = "requires_role") @Builder.Default private String requiresRole = "ADMIN";
    @Column(name = "num_approvers") @Builder.Default private Integer numApprovers = 1;
    @Builder.Default private Boolean active = true;
    @CreationTimestamp @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
}

