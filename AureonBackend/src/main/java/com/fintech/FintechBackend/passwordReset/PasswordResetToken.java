//package com.fintech.FintechBackend.passwordReset;
//
//import com.fintech.FintechBackend.entity.TeamMember;
//import jakarta.persistence.*;
//import lombok.*;
//import org.hibernate.annotations.CreationTimestamp;
//
//import java.time.LocalDateTime;
//import java.util.UUID;
//
//@Entity
//@Table(name = "password_reset_tokens")
//@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
//public class PasswordResetToken {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.UUID)
//    private UUID id;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "member_id", nullable = false)
//    private TeamMember member;
//
//    @Column(unique = true, nullable = false, length = 64)
//    private String token;
//
//    @Column(name = "expires_at", nullable = false)
//    private LocalDateTime expiresAt;
//
//    @Column(nullable = false)
//    @Builder.Default
//    private Boolean used = false;
//
//    @Column(name = "used_at")
//    private LocalDateTime usedAt;
//
//    @Column(name = "ip_address", columnDefinition = "INET")
//    private String ipAddress;
//
//    @Column(name = "user_agent")
//    private String userAgent;
//
//    @CreationTimestamp
//    @Column(name = "created_at", updatable = false)
//    private LocalDateTime createdAt;
//
//    public boolean isExpired() {
//        return expiresAt.isBefore(LocalDateTime.now());
//    }
//
//    public boolean isValid() {
//        return !used && !isExpired();
//    }
//}
