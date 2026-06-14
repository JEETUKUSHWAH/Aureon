//package com.fintech.FintechBackend.sessions;
//
//import com.fintech.FintechBackend.entity.Company;
//import com.fintech.FintechBackend.entity.Session;
//import com.fintech.FintechBackend.entity.TeamMember;
//import com.fintech.FintechBackend.exception.AccountLockedException;
//import com.fintech.FintechBackend.exception.UnauthorizedException;
//import com.fintech.FintechBackend.repository.CompanyRepository;
//import com.fintech.FintechBackend.repository.SessionRepository;
//import com.fintech.FintechBackend.repository.TeamMemberRepository;
//import com.fintech.FintechBackend.security.JwtUtil;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.scheduling.annotation.Scheduled;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.nio.charset.StandardCharsets;
//import java.security.MessageDigest;
//import java.security.NoSuchAlgorithmException;
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.UUID;
//
//@Service
//@RequiredArgsConstructor
//@Slf4j
//public class SessionService {
//
//    private final TeamMemberRepository memberRepo;
//    private final CompanyRepository companyRepo;
//    private final SessionRepository sessionRepo;
//    private final PasswordEncoder encoder;
//    private final JwtUtil jwtUtil;
//
//    @Value("${app.session.default-expiry-hours:24}")
//    private int defaultExpiryHours;
//
//    @Value("${app.session.remember-me-expiry-days:30}")
//    private int rememberMeDays;
//
//    /**
//     * Called by the frontend every ~14 minutes in the background.
//     * If the session is still valid, it issues a new access token + rotated refresh token
//     * WITHOUT requiring the user to type their password again.
//     * <p>
//     * rememberMe=true  → session can be refreshed for up to 30 days
//     * rememberMe=false → session can be refreshed for up to 24 hours
//     */
//    @Transactional
//    public TokenResponse silentRefresh(String rawRefreshToken, String ipAddress) {
//
//        String hash = sha256(rawRefreshToken);
//
//        Session session = sessionRepo.findByRefreshTokenHashAndRevokedFalse(hash)
//                .orElseThrow(() -> new UnauthorizedException("Invalid or revoked session"));
//
//        if (session.isExpired()) {
//            session.setRevoked(true);
//            sessionRepo.save(session);
//            throw new UnauthorizedException(
//                    session.getRememberMe()
//                            ? "Your 30-day session has expired. Please log in again."
//                            : "Your session has expired. Please log in again.");
//        }
//
//        // Rotate — revoke old token, issue new one (prevents token replay attacks)
//        session.setRevoked(true);
//        sessionRepo.save(session);
//
//        TeamMember member = session.getMember();
//        if (member.getStatus() != TeamMember.MemberStatus.ACTIVE)
//            throw new UnauthorizedException("Account is no longer active");
//
//        // Carry over rememberMe preference from the original login
//        TokenResponse newSession = createSession(
//                member, session.getRememberMe(), ipAddress, session.getUserAgent());
//
//        log.debug("Silent refresh: member={} rememberMe={}", member.getId(), session.getRememberMe());
//        return newSession;
//    }
//
//    // ── Logout current session ─────────────────────────────────────────────
//
//    @Transactional
//    public void logout(String rawRefreshToken) {
//        if (rawRefreshToken == null || rawRefreshToken.isBlank()) return;
//        String hash = sha256(rawRefreshToken);
//        sessionRepo.revokeByHash(hash);
//        log.debug("Session revoked by logout");
//    }
//
//    // ── Logout ALL sessions (e.g. "log out everywhere") ───────────────────
//
//
//    // ── Revoke a specific session (from "active sessions" screen) ─────────
//
//    @Transactional
//    public void revokeSession(UUID sessionId, UUID memberId) {
//        sessionRepo.revokeById(sessionId, memberId);
//    }
//
//    // ── List active sessions ───────────────────────────────────────────────
//
//    public List<SessionInfo> listSessions(UUID memberId, String currentTokenHash) {
//        return sessionRepo
//                .findByMemberIdAndRevokedFalseOrderByLastActiveAtDesc(memberId)
//                .stream()
//                .filter(s -> !s.isExpired())
//                .map(s -> new SessionInfo(
//                        s.getId(),
//                        s.getDeviceName(),
//                        s.getIpAddress(),
//                        s.getRememberMe(),
//                        s.getExpiresAt().toString(),
//                        s.getLastActiveAt().toString(),
//                        s.getRefreshTokenHash().equals(currentTokenHash)
//                ))
//                .toList();
//    }
//
//    // ── Scheduled cleanup — runs at 3 AM daily ────────────────────────────
//
//    @Scheduled(cron = "${app.session.cleanup-cron:0 0 3 * * *}")
//    @Transactional
//    public void cleanupExpiredSessions() {
//        int deleted = sessionRepo.deleteExpiredBefore(LocalDateTime.now().minusDays(7));
//        if (deleted > 0) log.info("Cleaned up {} expired sessions", deleted);
//    }
//
//    // ── Helpers ───────────────────────────────────────────────────────────
//
//    private TokenResponse createSession(TeamMember member, boolean rememberMe,
//                                        String ipAddress, String userAgent) {
//        Company company = member.getCompany();
//
//        // Generate raw refresh token (UUID-based, URL-safe)
//        String rawRefreshToken = UUID.randomUUID().toString().replace("-", "")
//                + UUID.randomUUID().toString().replace("-", "");
//
//        // Store only the hash — if the DB is ever breached, raw tokens can't be replayed
//        String tokenHash = sha256(rawRefreshToken);
//
//        // Expiry: 30 days if rememberMe, 24 hours otherwise
//        LocalDateTime expiresAt = rememberMe
//                ? LocalDateTime.now().plusDays(rememberMeDays)
//                : LocalDateTime.now().plusHours(defaultExpiryHours);
//
//        Session session = Session.builder()
//                .member(member)
//                .company(company)
//                .refreshTokenHash(tokenHash)
//                .deviceName(parseDevice(userAgent))
//                .ipAddress(ipAddress)
//                .userAgent(userAgent)
//                .rememberMe(rememberMe)
//                .expiresAt(expiresAt)
//                .build();
//        sessionRepo.save(session);
//
//        // Access token stays short-lived (15 min) — this is intentional
//        // The refresh mechanism makes it feel like "always logged in"
//        String accessToken = jwtUtil.generateAccess(
//                member.getId(), company.getId(), member.getRole().name());
//
//        return new TokenResponse(
//                accessToken,
//                rawRefreshToken,          // send raw token to client, store hash in DB
//                member.getId(),
//                company.getId(),
//                member.getRole().name(),
//                company.getStatus().name(),
//                company.getKybStatus().name(),
//                rememberMe,
//                expiresAt
//        );
//    }
//
//    private void recordFailedAttempt(TeamMember member) {
//        int attempts = member.getFailedAttempts() + 1;
//        member.setFailedAttempts(attempts);
//        if (attempts >= 5) {
//            member.setLockedUntil(LocalDateTime.now().plusMinutes(15));
//            log.warn("Account locked after {} failed attempts: {}", attempts, member.getId());
//        }
//        memberRepo.save(member);
//    }
//
//    private String sha256(String input) {
//        try {
//            MessageDigest digest = MessageDigest.getInstance("SHA-256");
//            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
//            StringBuilder hex = new StringBuilder();
//            for (byte b : hash) hex.append(String.format("%02x", b));
//            return hex.toString();
//        } catch (NoSuchAlgorithmException e) {
//            throw new RuntimeException("SHA-256 not available", e);
//        }
//    }
//
//    private String parseDevice(String userAgent) {
//        if (userAgent == null) return "Unknown device";
//        if (userAgent.contains("Chrome")) return "Chrome browser";
//        if (userAgent.contains("Firefox")) return "Firefox browser";
//        if (userAgent.contains("Safari")) return "Safari browser";
//        if (userAgent.contains("PostmanRuntime")) return "Postman";
//        if (userAgent.contains("curl")) return "cURL / API client";
//        return "Unknown device";
//    }
//
//    // expose for session listing (hashing a token to find the current session)
//    public String hashToken(String raw) {
//        return sha256(raw);
//    }
//}
