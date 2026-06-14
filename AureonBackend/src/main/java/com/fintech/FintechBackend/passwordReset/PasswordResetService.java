//package com.fintech.FintechBackend.passwordReset;
//
//import com.fintech.FintechBackend.entity.TeamMember;
//import com.fintech.FintechBackend.exception.BadRequestException;
//import com.fintech.FintechBackend.exception.NotFoundException;
//import com.fintech.FintechBackend.exception.UnauthorizedException;
//import com.fintech.FintechBackend.repository.TeamMemberRepository;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.scheduling.annotation.Scheduled;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.security.SecureRandom;
//import java.time.LocalDateTime;
//import java.util.Base64;
//import java.util.Optional;
//import java.util.UUID;
//
//@Service
//@RequiredArgsConstructor
//@Slf4j
//public class PasswordResetService {
//
//    private final TeamMemberRepository memberRepo;
//    private final PasswordResetTokenRepository tokenRepo;
//    private final PasswordEncoder encoder;
//    private final SecureRandom random = new SecureRandom();
//
//    // ── Forgot Password (Step 1: Request reset link) ─────────────────────────
//
//    @Transactional
//    public void requestPasswordReset(String email, String ipAddress, String userAgent) {
//
//        // Find member by email - use findAll to avoid revealing if email exists
//        Optional<TeamMember> memberOpt = memberRepo.findByEmail(email);
//
//        if (memberOpt.isEmpty()) {
//            // Security: Don't reveal if email exists
//            // Still return success but don't actually send anything
//            log.info("Password reset requested for non-existent email: {}", email);
//            return;
//        }
//
//        TeamMember member = memberOpt.get();
//
//        if (member.getStatus() != TeamMember.MemberStatus.ACTIVE) {
//            log.warn("Password reset requested for inactive account: {}", email);
//            return;
//        }
//
//        // Invalidate all existing tokens for this member
//        tokenRepo.invalidateAllByMemberId(member.getId());
//
//        // Generate secure random token
//        String token = generateSecureToken();
//
//        // Token expires in 1 hour
//        LocalDateTime expiresAt = LocalDateTime.now().plusHours(1);
//
//        PasswordResetToken resetToken = PasswordResetToken.builder()
//                .member(member)
//                .token(token)
//                .expiresAt(expiresAt)
//                .ipAddress(ipAddress)
//                .userAgent(userAgent)
//                .build();
//
//        tokenRepo.save(resetToken);
//
//        // In production: Send email via SendGrid/AWS SES/Postmark
//        // For now: Log the reset link
//        String resetLink = String.format("http://localhost:3000/reset-password?token=%s", token);
//
//        log.info("═══════════════════════════════════════════════════════════");
//        log.info("PASSWORD RESET EMAIL (MOCK)");
//        log.info("To: {}", email);
//        log.info("Subject: Reset your password");
//        log.info("───────────────────────────────────────────────────────────");
//        log.info("Hi {},", member.getFirstName());
//        log.info("");
//        log.info("You requested to reset your password. Click the link below:");
//        log.info("{}", resetLink);
//        log.info("");
//        log.info("This link expires in 1 hour.");
//        log.info("If you didn't request this, you can safely ignore this email.");
//        log.info("═══════════════════════════════════════════════════════════");
//
//        // In real implementation:
//        // emailService.send(
//        //   to: email,
//        //   subject: "Reset your password",
//        //   template: "password-reset",
//        //   data: { name: member.getFirstName(), resetLink: resetLink }
//        // )
//    }
//
//    // ── Reset Password (Step 2: Submit new password with token) ──────────────
//
//    @Transactional
//    public void resetPassword(String token, String newPassword) {
//
//        PasswordResetToken resetToken = tokenRepo.findByTokenAndUsedFalse(token)
//                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));
//
//        if (resetToken.isExpired()) {
//            throw new BadRequestException("Reset token has expired. Please request a new one.");
//        }
//
//        TeamMember member = resetToken.getMember();
//
//        // Check if new password is same as current (optional security measure)
//        if (encoder.matches(newPassword, member.getPasswordHash())) {
//            throw new BadRequestException("New password must be different from current password");
//        }
//
//        // Update password
//        member.setPasswordHash(encoder.encode(newPassword));
//        member.setLastPasswordChanged(LocalDateTime.now());
//
//        // Reset failed login attempts if any
//        member.setFailedAttempts(0);
//        member.setLockedUntil(null);
//
//        memberRepo.save(member);
//
//        // Mark token as used
//        resetToken.setUsed(true);
//        resetToken.setUsedAt(LocalDateTime.now());
//        tokenRepo.save(resetToken);
//
//        log.info("Password reset successful for member: {}", member.getId());
//
//        // In production: Send confirmation email
//        // emailService.send(
//        //   to: member.getEmail(),
//        //   subject: "Your password was changed",
//        //   template: "password-changed",
//        //   data: { name: member.getFirstName(), timestamp: LocalDateTime.now() }
//        // )
//    }
//
//    // ── Update Password (Authenticated user changing their own password) ──────
//
//    @Transactional
//    public void updatePassword(UUID memberId, String currentPassword, String newPassword) {
//
//        TeamMember member = memberRepo.findById(memberId)
//                .orElseThrow(() -> new NotFoundException("Member not found"));
//
//        // Verify current password
//        if (!encoder.matches(currentPassword, member.getPasswordHash())) {
//            throw new UnauthorizedException("Current password is incorrect");
//        }
//
//        // Check if new password is same as current
//        if (encoder.matches(newPassword, member.getPasswordHash())) {
//            throw new BadRequestException("New password must be different from current password");
//        }
//
//        // Update password
//        member.setPasswordHash(encoder.encode(newPassword));
//        member.setLastPasswordChanged(LocalDateTime.now());
//        memberRepo.save(member);
//
//        // Invalidate all existing password reset tokens
//        tokenRepo.invalidateAllByMemberId(memberId);
//
//        log.info("Password updated for member: {}", memberId);
//
//        // In production: Send confirmation email
//        // emailService.send(...)
//    }
//
//    // ── Verify Token (Check if reset token is valid before showing form) ─────
//
//    public boolean verifyResetToken(String token) {
//        return tokenRepo.findByTokenAndUsedFalse(token)
//                .map(PasswordResetToken::isValid)
//                .orElse(false);
//    }
//
//    // ── Cleanup expired tokens (runs daily at 3 AM) ──────────────────────────
//
//    @Scheduled(cron = "0 0 3 * * *")
//    @Transactional
//    public void cleanupExpiredTokens() {
//        int deleted = tokenRepo.deleteExpiredBefore(LocalDateTime.now().minusDays(1));
//        if (deleted > 0) {
//            log.info("Cleaned up {} expired password reset tokens", deleted);
//        }
//    }
//
//    // ── Helpers ───────────────────────────────────────────────────────────────
//
//    private String generateSecureToken() {
//        byte[] tokenBytes = new byte[32];
//        random.nextBytes(tokenBytes);
//
//        // Convert to URL-safe base64
//        return Base64.getUrlEncoder()
//                .withoutPadding()
//                .encodeToString(tokenBytes);
//    }
//}
