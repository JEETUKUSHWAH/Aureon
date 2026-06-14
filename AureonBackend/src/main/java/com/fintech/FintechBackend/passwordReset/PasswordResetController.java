//package com.fintech.FintechBackend.passwordReset;
//
//import com.fintech.FintechBackend.company.ApiResponse;
//import com.fintech.FintechBackend.security.AuthPrincipal;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.validation.Valid;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.core.annotation.AuthenticationPrincipal;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.Map;
//
//@RestController
//@RequestMapping("/api/auth/password")
//@RequiredArgsConstructor
//@Slf4j
//public class PasswordResetController {
//
//    private final PasswordResetService passwordService;
//
//    /**
//     * Step 1: Request password reset
//     * Public endpoint - anyone can request a reset link
//     */
//    @PostMapping("/forgot")
//    public ResponseEntity<ApiResponse<Void>> forgotPassword(
//            @Valid @RequestBody ForgotPasswordRequest req,
//            HttpServletRequest httpReq) {
//
//        String ip = extractIp(httpReq);
//        String userAgent = httpReq.getHeader("User-Agent");
//
//        passwordService.requestPasswordReset(req.email(), ip, userAgent);
//
//        // Always return success to avoid email enumeration
//        return ResponseEntity.ok(ApiResponse.ok(null,
//                "If that email exists, we've sent a password reset link. Check your inbox."));
//    }
//
//    /**
//     * Step 2: Verify token is valid (before showing reset form)
//     * Public endpoint
//     */
//    @GetMapping("/reset/verify")
//    public ResponseEntity<ApiResponse<Map<String, Boolean>>> verifyToken(
//            @RequestParam String token) {
//
//        boolean valid = passwordService.verifyResetToken(token);
//        return ResponseEntity.ok(ApiResponse.ok(Map.of("valid", valid)));
//    }
//
//    /**
//     * Step 3: Submit new password with token
//     * Public endpoint
//     */
//    @PostMapping("/reset")
//    public ResponseEntity<ApiResponse<Void>> resetPassword(
//            @Valid @RequestBody ResetPasswordRequest req) {
//
//        passwordService.resetPassword(req.token(), req.newPassword());
//
//        return ResponseEntity.ok(ApiResponse.ok(null,
//                "Password reset successful. You can now log in with your new password."));
//    }
//
//    /**
//     * Update password (authenticated user)
//     * Protected endpoint - requires valid JWT
//     */
//    @PutMapping("/update")
//    public ResponseEntity<ApiResponse<Void>> updatePassword(
//            @Valid @RequestBody UpdatePasswordRequest req,
//            @AuthenticationPrincipal AuthPrincipal principal) {
//
//        passwordService.updatePassword(
//                principal.memberId(),
//                req.currentPassword(),
//                req.newPassword()
//        );
//
//        return ResponseEntity.ok(ApiResponse.ok(null, "Password updated successfully"));
//    }
//
//    private String extractIp(HttpServletRequest req) {
//        String forwarded = req.getHeader("X-Forwarded-For");
//        return (forwarded != null && !forwarded.isBlank())
//                ? forwarded.split(",")[0].trim()
//                : req.getRemoteAddr();
//    }
//}
