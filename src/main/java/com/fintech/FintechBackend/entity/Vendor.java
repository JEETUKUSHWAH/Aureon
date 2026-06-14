package com.fintech.FintechBackend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "vendors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vendor {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;
    @Column(nullable = false)
    private String name;
    private String email;
    @Column(name = "bank_name")
    private String bankName;
    @Column(name = "account_number")
    private String accountNumber;
    @Column(name = "routing_number")
    private String routingNumber;
    @Column(name = "payment_method")
    @Builder.Default
    private String paymentMethod = "ACH";
    @Builder.Default
    private String currency = "USD";
    private String address, notes;
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
