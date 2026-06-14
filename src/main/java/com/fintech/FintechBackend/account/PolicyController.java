package com.fintech.FintechBackend.account;

import com.fintech.FintechBackend.company.ApiResponse;
import com.fintech.FintechBackend.security.AuthPrincipal;
import com.fintech.FintechBackend.supportEntities.ApprovalPolicy;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/policies")
@RequiredArgsConstructor
class PolicyController {
    private final PolicyService policyService;

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<ApiResponse<ApprovalPolicy>> create(@Valid @RequestBody CreatePolicyRequest req, @AuthenticationPrincipal AuthPrincipal p) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(policyService.create(req, p.companyId())));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ApprovalPolicy>>> list(@AuthenticationPrincipal AuthPrincipal p) {
        return ResponseEntity.ok(ApiResponse.ok(policyService.list(p.companyId())));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable UUID id, @AuthenticationPrincipal AuthPrincipal p) {
        policyService.deactivate(id, p.companyId());
        return ResponseEntity.ok(ApiResponse.ok(null, "Policy deactivated"));
    }
}
