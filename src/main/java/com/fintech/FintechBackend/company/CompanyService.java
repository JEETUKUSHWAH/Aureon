package com.fintech.FintechBackend.company;

import com.fintech.FintechBackend.entity.*;
import com.fintech.FintechBackend.exception.AccountLockedException;
import com.fintech.FintechBackend.exception.ConflictException;
import com.fintech.FintechBackend.exception.UnauthorizedException;
import com.fintech.FintechBackend.mockapi.MockKybService;
import com.fintech.FintechBackend.repository.*;
import com.fintech.FintechBackend.security.JwtUtil;
import com.fintech.FintechBackend.sessions.LoginRequest;
import com.fintech.FintechBackend.sessions.SessionInfo;
import com.fintech.FintechBackend.sessions.TokenResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@Slf4j
public class CompanyService {

    private final CompanyRepository companyRepo;
    private final TeamMemberRepository memberRepo;
    private final AccountRepository accountRepo;
    private final KybVerificationRepository kybRepo;
    private final RefreshTokenRepository tokenRepo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwt;
    private final MockKybService mockKyb;

    private final SessionRepository sessionRepo;

    @Value("${app.session.default-expiry-hours:24}")
    private int defaultExpiryHours;

    @Value("${app.session.remember-me-expiry-days:30}")
    private int rememberMeDays;

    @Transactional
    public TokenResponse onboard(OnboardRequest req) {
        if (memberRepo.findByEmail(req.ownerEmail()).isPresent()) {
            throw new ConflictException("Email already registered");
        }

        // Create company
        Company company = Company.builder()
                .legalName(req.legalName()).displayName(req.displayName())
                .ein(req.ein()).businessType(req.businessType())
                .industry(req.industry()).website(req.website()).phone(req.phone())
                .addressLine1(req.addressLine1()).addressLine2(req.addressLine2())
                .city(req.city()).state(req.state()).country(req.country()).postalCode(req.postalCode())
                .build();
        company = companyRepo.save(company);

        // Create owner
        TeamMember owner = TeamMember.builder()
                .company(company)
                .email(req.ownerEmail())
                .passwordHash(encoder.encode(req.ownerPassword()))
                .firstName(req.ownerFirstName()).lastName(req.ownerLastName())
                .phone(req.ownerPhone())
                .role(TeamMember.MemberRole.OWNER)
                .build();
        owner = memberRepo.save(owner);

        // Create default checking account
        Account checking = Account.builder()
                .company(company)
                .accountNumber(generateAccountNumber())
                .accountType(Account.AccountType.CHECKING)
                .currency("USD")
                .nickname("Main Checking")
                .build();
        accountRepo.save(checking);

        // Submit KYB
        KybVerification kyb = KybVerification.builder()
                .company(company).ein(req.ein()).legalName(req.legalName())
                .businessType(req.businessType().name())
                .incorporationState(req.incorporationState())
                .incorporationDate(req.incorporationDate())
                .docArticlesUrl(req.docArticlesUrl()).docEinLetterUrl(req.docEinLetterUrl())
                .build();
        kyb = kybRepo.save(kyb);

        // Trigger mock KYB async
        mockKyb.processAsync(kyb.getId().toString(), "KYB-" + System.currentTimeMillis(),
                determineOutcome(req.ein()), null);

        log.info("Company onboarded: {} owner: {}", company.getId(), owner.getId());
        return issueTokens(owner, company);
    }

    @Transactional
    public TokenResponse login(LoginRequest req, String ipAddress, String userAgent) throws UnknownHostException {

        TeamMember member = memberRepo.findByEmail(req.email())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (member.isLocked())
            throw new AccountLockedException("Account locked. Try again later.");
        if (member.getStatus() != TeamMember.MemberStatus.ACTIVE)
            throw new UnauthorizedException("Account is not active");
        if (!encoder.matches(req.password(), member.getPasswordHash())) {
            int attempts = member.getFailedAttempts() + 1;
            member.setFailedAttempts(attempts);
            if (attempts >= 5) member.setLockedUntil(LocalDateTime.now().plusMinutes(15));
            memberRepo.save(member);
            recordFailedAttempt(member);
            throw new UnauthorizedException("Invalid credentials");
        }

        // Reset lockout on successful login
        member.setFailedAttempts(0);
        member.setLockedUntil(null);
        member.setLastLogin(LocalDateTime.now());
        memberRepo.save(member);

        return createSession(member, req.rememberMe(), ipAddress, userAgent);
    }

    /**
     * Called by the frontend every ~14 minutes in the background.
     * If the session is still valid, it issues a new access token + rotated refresh token
     * WITHOUT requiring the user to type their password again.
     * <p>
     * rememberMe=true  → session can be refreshed for up to 30 days
     * rememberMe=false → session can be refreshed for up to 24 hours
     */
    @Transactional
    public TokenResponse silentRefresh(String rawRefreshToken, String ipAddress) throws UnknownHostException {

        String hash = sha256(rawRefreshToken);

        Session session = sessionRepo.findByRefreshTokenHashAndRevokedFalse(hash)
                .orElseThrow(() -> new UnauthorizedException("Invalid or revoked session"));

        if (session.isExpired()) {
            session.setRevoked(true);
            sessionRepo.save(session);
            throw new UnauthorizedException(
                    session.getRememberMe()
                            ? "Your 30-day session has expired. Please log in again."
                            : "Your session has expired. Please log in again.");
        }

        // Rotate — revoke old token, issue new one (prevents token replay attacks)
        session.setRevoked(true);
        sessionRepo.save(session);

        TeamMember member = session.getMember();
        if (member.getStatus() != TeamMember.MemberStatus.ACTIVE)
            throw new UnauthorizedException("Account is no longer active");

        // Carry over rememberMe preference from the original login
        TokenResponse newSession = createSession(
                member, session.getRememberMe(), ipAddress, session.getUserAgent());

        log.debug("Silent refresh: member={} rememberMe={}", member.getId(), session.getRememberMe());
        return newSession;
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) return;
        String hash = sha256(rawRefreshToken);
        sessionRepo.revokeByHash(hash);
        log.debug("Session revoked by logout");
    }

    private TokenResponse issueTokens(TeamMember m, Company c) {
        String access = jwt.generateAccess(m.getId(), c.getId(), m.getRole().name());
        String refresh = jwt.generateRefresh(m.getId());
        tokenRepo.save(RefreshToken.builder().member(m).token(refresh)
                .expiresAt(LocalDateTime.now().plusNanos(jwt.getRefreshExpiry() * 1_000_000L)).build());
        return new TokenResponse(access, refresh, m.getId(), c.getId(),
                m.getRole().name(), c.getStatus().name(), c.getKybStatus().name(), c.getRememberMe(), c.getExpiresAt());
    }

    @Transactional
    public void logoutAll(UUID memberId) {
        sessionRepo.revokeAllByMemberId(memberId);
        log.info("All sessions revoked for member={}", memberId);
    }

    @Transactional
    public void revokeSession(UUID sessionId, UUID memberId) {
        sessionRepo.revokeById(sessionId, memberId);
    }

    public List<SessionInfo> listSessions(UUID memberId, String currentTokenHash) {
        return sessionRepo
                .findByMemberIdAndRevokedFalseOrderByLastActiveAtDesc(memberId)
                .stream()
                .filter(s -> !s.isExpired())
                .map(s -> new SessionInfo(
                        s.getId(),
                        s.getDeviceName(),
                        s.getIpAddress(),
                        s.getRememberMe(),
                        s.getExpiresAt().toString(),
                        s.getLastActiveAt().toString(),
                        s.getRefreshTokenHash().equals(currentTokenHash)
                ))
                .toList();
    }

    @Scheduled(cron = "${app.session.cleanup-cron:0 0 3 * * *}")
    @Transactional
    public void cleanupExpiredSessions() {
        int deleted = sessionRepo.deleteExpiredBefore(LocalDateTime.now().minusDays(7));
        if (deleted > 0) log.info("Cleaned up {} expired sessions", deleted);
    }

    private TokenResponse createSession(TeamMember member, boolean rememberMe,
                                        String ipAddress, String userAgent) throws UnknownHostException {
        Company company = member.getCompany();

        // Generate raw refresh token (UUID-based, URL-safe)
        String rawRefreshToken = UUID.randomUUID().toString().replace("-", "")
                + UUID.randomUUID().toString().replace("-", "");

        // Store only the hash — if the DB is ever breached, raw tokens can't be replayed
        String tokenHash = sha256(rawRefreshToken);

        // Expiry: 30 days if rememberMe, 24 hours otherwise
        LocalDateTime expiresAt = rememberMe
                ? LocalDateTime.now().plusDays(rememberMeDays)
                : LocalDateTime.now().plusHours(defaultExpiryHours);

        Session session = Session.builder()
                .member(member)
                .company(company)
                .refreshTokenHash(tokenHash)
                .deviceName(parseDevice(userAgent))
                .ipAddress(InetAddress.getByName(ipAddress))
                .userAgent(userAgent)
                .rememberMe(rememberMe)
                .expiresAt(expiresAt)
                .build();
        sessionRepo.save(session);

        // Access token stays short-lived (15 min) — this is intentional
        // The refresh mechanism makes it feel like "always logged in"
        String accessToken = jwt.generateAccess(
                member.getId(), company.getId(), member.getRole().name());

        return new TokenResponse(
                accessToken,
                rawRefreshToken,          // send raw token to client, store hash in DB
                member.getId(),
                company.getId(),
                member.getRole().name(),
                company.getStatus().name(),
                company.getKybStatus().name(),
                rememberMe,
                expiresAt
        );
    }

    private void recordFailedAttempt(TeamMember member) {
        int attempts = member.getFailedAttempts() + 1;
        member.setFailedAttempts(attempts);
        if (attempts >= 5) {
            member.setLockedUntil(LocalDateTime.now().plusMinutes(15));
            log.warn("Account locked after {} failed attempts: {}", attempts, member.getId());
        }
        memberRepo.save(member);
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) hex.append(String.format("%02x", b));
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }

    private String parseDevice(String userAgent) {
        if (userAgent == null) return "Unknown device";
        if (userAgent.contains("Chrome")) return "Chrome browser";
        if (userAgent.contains("Firefox")) return "Firefox browser";
        if (userAgent.contains("Safari")) return "Safari browser";
        if (userAgent.contains("PostmanRuntime")) return "Postman";
        if (userAgent.contains("curl")) return "cURL / API client";
        return "Unknown device";
    }

    // expose for session listing (hashing a token to find the current session)
    public String hashToken(String raw) {
        return sha256(raw);
    }

    private String determineOutcome(String ein) {
        if (ein != null && ein.startsWith("99")) return "REJECTED";
        if (ein != null && ein.startsWith("11")) return "INFO_REQUIRED";
        return "APPROVED";
    }

    private String generateAccountNumber() {
        return "ML" + System.currentTimeMillis() % 1_000_000_000L
                + String.format("%02d", ThreadLocalRandom.current().nextInt(100));
    }
}
