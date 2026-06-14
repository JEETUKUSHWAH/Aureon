package com.fintech.FintechBackend.company;

import com.fintech.FintechBackend.security.AuthPrincipal;
import com.fintech.FintechBackend.sessions.LoginRequest;
import com.fintech.FintechBackend.sessions.RefreshRequest;
import com.fintech.FintechBackend.sessions.SessionInfo;
import com.fintech.FintechBackend.sessions.TokenResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.UnknownHostException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
class AuthController {

    private final CompanyService companyService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<TokenResponse>> login(
            @Valid @RequestBody LoginRequest req,
            HttpServletRequest httpReq) throws UnknownHostException {

        String ip = extractIp(httpReq);
        String userAgent = httpReq.getHeader("User-Agent");
        return ResponseEntity.ok(ApiResponse.ok(companyService.login(req, ip, userAgent)));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenResponse>> refresh(
            @Valid @RequestBody RefreshRequest req,
            HttpServletRequest httpReq) throws UnknownHostException {

        return ResponseEntity.ok(ApiResponse.ok(
                companyService.silentRefresh(req.refreshToken(), extractIp(httpReq))));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestBody(required = false) RefreshRequest req) {

        if (req != null) companyService.logout(req.refreshToken());
        return ResponseEntity.ok(ApiResponse.ok(null, "Logged out"));
    }

    @PostMapping("/logout-all")
    public ResponseEntity<ApiResponse<Void>> logoutAll(
            @AuthenticationPrincipal AuthPrincipal p) {

        companyService.logoutAll(p.memberId());
        return ResponseEntity.ok(ApiResponse.ok(null, "All sessions revoked"));
    }

    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<SessionInfo>>> listSessions(
            @RequestHeader(value = "X-Refresh-Token", required = false) String rawRefreshToken,
            @AuthenticationPrincipal AuthPrincipal p) {

        String currentHash = rawRefreshToken != null
                ? companyService.hashToken(rawRefreshToken) : null;
        return ResponseEntity.ok(ApiResponse.ok(
                companyService.listSessions(p.memberId(), currentHash)));
    }

    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<ApiResponse<Void>> revokeSession(
            @PathVariable UUID sessionId,
            @AuthenticationPrincipal AuthPrincipal p) {

        companyService.revokeSession(sessionId, p.memberId());
        return ResponseEntity.ok(ApiResponse.ok(null, "Session revoked"));
    }

    private String extractIp(HttpServletRequest req) {
        String forwarded = req.getHeader("X-Forwarded-For");
        return (forwarded != null && !forwarded.isBlank())
                ? forwarded.split(",")[0].trim()
                : req.getRemoteAddr();
    }
}
