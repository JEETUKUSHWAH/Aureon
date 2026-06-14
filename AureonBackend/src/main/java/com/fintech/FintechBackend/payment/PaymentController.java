package com.fintech.FintechBackend.payment;

import com.fintech.FintechBackend.company.ApiResponse;
import com.fintech.FintechBackend.entity.ApprovalRequest;
import com.fintech.FintechBackend.entity.Transaction;
import com.fintech.FintechBackend.security.AuthPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/upi")
    public ResponseEntity<ApiResponse<Transaction>> upi(
            @Valid @RequestBody UpiRequest req, @AuthenticationPrincipal AuthPrincipal p) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(paymentService.initiateUpi(req, p.companyId(), p.memberId())));
    }

    @PostMapping("/neft")
    public ResponseEntity<ApiResponse<Transaction>> neft(
            @Valid @RequestBody NeftRequest req, @AuthenticationPrincipal AuthPrincipal p) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(paymentService.initiateNeft(req, p.companyId(), p.memberId())));
    }

    @PostMapping("/ach")
    public ResponseEntity<ApiResponse<Transaction>> ach(
            @Valid @RequestBody AchRequest req, @AuthenticationPrincipal AuthPrincipal p) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(paymentService.initiateAch(req, p.companyId(), p.memberId())));
    }

    @PostMapping("/wire")
    public ResponseEntity<ApiResponse<Transaction>> wire(
            @Valid @RequestBody WireRequest req, @AuthenticationPrincipal AuthPrincipal p) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(paymentService.initiateWire(req, p.companyId(), p.memberId())));
    }

    @PostMapping("/international")
    public ResponseEntity<ApiResponse<Transaction>> international(
            @Valid @RequestBody InternationalRequest req, @AuthenticationPrincipal AuthPrincipal p) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(paymentService.initiateInternational(req, p.companyId(), p.memberId())));
    }

    @PostMapping("/check")
    public ResponseEntity<ApiResponse<Transaction>> check(
            @Valid @RequestBody CheckRequest req, @AuthenticationPrincipal AuthPrincipal p) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(paymentService.mailCheck(req, p.companyId(), p.memberId())));
    }

    @PostMapping("/transfer")
    public ResponseEntity<ApiResponse<Transaction>> bookTransfer(
            @Valid @RequestBody BookTransferRequest req, @AuthenticationPrincipal AuthPrincipal p) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(paymentService.bookTransfer(req, p.companyId(), p.memberId())));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Transaction>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String rail,
            @AuthenticationPrincipal AuthPrincipal p) {
        return ResponseEntity.ok(ApiResponse.ok(paymentService.listTransactions(p.companyId(), page, size, status, rail)));
    }

    @GetMapping("/approvals/pending")
    public ResponseEntity<ApiResponse<List<ApprovalRequest>>> pendingApprovals(@AuthenticationPrincipal AuthPrincipal p) {
        return ResponseEntity.ok(ApiResponse.ok(paymentService.pendingApprovals(p.companyId())));
    }

    @PostMapping("/approvals/{id}/resolve")
    public ResponseEntity<ApiResponse<ApprovalRequest>> resolveApproval(
            @PathVariable UUID id, @Valid @RequestBody ApprovalActionRequest action,
            @AuthenticationPrincipal AuthPrincipal p) {
        return ResponseEntity.ok(ApiResponse.ok(paymentService.resolveApproval(id, action, p.companyId(), p.memberId())));
    }

    @GetMapping("/fx-rate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> fxRate(
            @RequestParam(defaultValue = "USD") String from,
            @RequestParam(defaultValue = "INR") String to,
            @AuthenticationPrincipal AuthPrincipal p) {
        BigDecimal rate = paymentService.getCurrentFxRate(from, to);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("from", from, "to", to, "rate", rate, "source", "mock")));
    }
}
