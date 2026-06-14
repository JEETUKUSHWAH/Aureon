package com.fintech.FintechBackend.supportEntities;

import com.fintech.FintechBackend.entity.Company;
import com.fintech.FintechBackend.entity.TeamMember;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "accounting_exports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountingExport {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;
    @Column(name = "export_type")
    private String exportType;
    @Column(name = "from_date")
    private java.time.LocalDate fromDate;
    @Column(name = "to_date")
    private java.time.LocalDate toDate;
    @Builder.Default
    private String status = "PENDING";
    @Column(name = "file_url")
    private String fileUrl;
    @Column(name = "record_count")
    private Integer recordCount;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private TeamMember createdBy;
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
