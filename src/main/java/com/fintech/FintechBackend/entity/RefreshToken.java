package com.fintech.FintechBackend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;
@Entity
@Table(name = "refresh_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private TeamMember member;
    @Column(unique = true, nullable = false, columnDefinition = "TEXT")
    private String token;
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
    @Builder.Default
    private Boolean revoked = false;
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public boolean isExpired() {
        return expiresAt.isBefore(LocalDateTime.now());
    }
}
