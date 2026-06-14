package com.fintech.FintechBackend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "team_members")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamMember {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;
    @Column(nullable = false)
    private String email;
    @Column(name = "password_hash")
    private String passwordHash;
    @Column(name = "first_name", nullable = false)
    private String firstName;
    @Column(name = "last_name", nullable = false)
    private String lastName;
    private String phone;
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private MemberRole role = MemberRole.MEMBER;
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private MemberStatus status = MemberStatus.ACTIVE;
    @Column(name = "invite_token")
    private String inviteToken;
    @Column(name = "invite_expires")
    private LocalDateTime inviteExpires;
    @Column(name = "last_login")
    private LocalDateTime lastLogin;
    @Column(name = "failed_attempts")
    @Builder.Default
    private Integer failedAttempts = 0;
    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum MemberRole {OWNER, ADMIN, MEMBER, BOOKKEEPER, VIEWER}

    public enum MemberStatus {ACTIVE, INVITED, SUSPENDED, REMOVED}

    public boolean isLocked() {
        return lockedUntil != null && lockedUntil.isAfter(LocalDateTime.now());
    }

    public boolean canApprove() {
        return role == MemberRole.OWNER || role == MemberRole.ADMIN;
    }

    public boolean canInitiatePayments() {
        return role != MemberRole.VIEWER;
    }
}
