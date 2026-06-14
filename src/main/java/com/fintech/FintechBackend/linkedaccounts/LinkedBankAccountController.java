package com.fintech.FintechBackend.linkedaccounts;

import com.fintech.FintechBackend.company.ApiResponse;
import com.fintech.FintechBackend.entity.Transaction;
import com.fintech.FintechBackend.exception.NotFoundException;
import com.fintech.FintechBackend.security.AuthPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/linked-accounts")
@RequiredArgsConstructor
public class LinkedBankAccountController {

    private final LinkedBankAccountService service;

    /**
     * Step 1 — Submit external bank details
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<ApiResponse<LinkedAccountResponse>> link(
            @Valid @RequestBody LinkAccountRequest req,
            @AuthenticationPrincipal AuthPrincipal p) {

        LinkedAccountResponse resp = service.linkAccount(req, p.companyId(), p.memberId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(resp,
                        "Bank account submitted. Two small deposits will appear in your " +
                                req.bankName() + " account within 1–3 business days. " +
                                "Return here and enter the amounts to verify ownership."));
    }

    /**
     * Step 2 — Verify by entering micro-deposit amounts
     */
    @PostMapping("/{id}/verify")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<ApiResponse<LinkedAccountResponse>> verify(
            @PathVariable UUID id,
            @Valid @RequestBody VerifyRequest req,
            @AuthenticationPrincipal AuthPrincipal p) {

        return ResponseEntity.ok(ApiResponse.ok(
                service.verify(id, req, p.companyId(), p.memberId()),
                "Bank account successfully verified. You can now fund your platform account."));
    }

    /**
     * Step 3 — Pull funds from verified external account into platform account
     */
    @PostMapping("/{id}/fund")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<ApiResponse<Transaction>> fund(
            @PathVariable UUID id,
            @Valid @RequestBody FundRequest req,
            @AuthenticationPrincipal AuthPrincipal p) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(
                        service.fundFromLinkedAccount(id, req, p.companyId(), p.memberId()),
                        "Funds pulled successfully. Balance will reflect shortly."));
    }

    /**
     * List all linked accounts for this company
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<LinkedAccountResponse>>> list(
            @AuthenticationPrincipal AuthPrincipal p) {

        return ResponseEntity.ok(ApiResponse.ok(service.listLinkedAccounts(p.companyId())));
    }

    /**
     * Remove a linked account
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<ApiResponse<Void>> remove(
            @PathVariable UUID id,
            @AuthenticationPrincipal AuthPrincipal p) {

        service.removeLinkedAccount(id, p.companyId());
        return ResponseEntity.ok(ApiResponse.ok(null, "Linked account removed"));
    }

    /**
     * DEV ONLY — shows the micro-deposit amounts for testing without checking a real bank.
     * Remove this endpoint in production!
     */
    @GetMapping("/{id}/dev-peek")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> devPeek(
            @PathVariable UUID id,
            @AuthenticationPrincipal AuthPrincipal p) {

        var linked = service.linkedRepo.findByIdAndCompanyId(id, p.companyId())
                .orElseThrow(() -> new NotFoundException("Not found"));

        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "note", "DEV ONLY — remove in production",
                "status", linked.getStatus().name(),
                "amount1", linked.getMicroDeposit1() != null ? linked.getMicroDeposit1() : "not yet sent",
                "amount2", linked.getMicroDeposit2() != null ? linked.getMicroDeposit2() : "not yet sent",
                "expiresAt", linked.getMicroExpiresAt() != null ? linked.getMicroExpiresAt() : "n/a"
        )));
    }
}
