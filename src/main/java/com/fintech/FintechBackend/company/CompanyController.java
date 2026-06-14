package com.fintech.FintechBackend.company;

import com.fintech.FintechBackend.entity.Company;
import com.fintech.FintechBackend.exception.NotFoundException;
import com.fintech.FintechBackend.repository.CompanyRepository;
import com.fintech.FintechBackend.repository.KybVerificationRepository;
import com.fintech.FintechBackend.security.AuthPrincipal;
import com.fintech.FintechBackend.sessions.TokenResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
class CompanyController {

    private final CompanyService companyService;
    private final CompanyRepository companyRepo;
    private final KybVerificationRepository kybRepo;

    @PostMapping("/onboard_company")
    public ResponseEntity<ApiResponse<TokenResponse>> onboard(@Valid @RequestBody OnboardRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(companyService.onboard(req), "Company registered. KYB verification initiated."));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Company>> getCompany(@AuthenticationPrincipal AuthPrincipal p) {
        Company c = companyRepo.findById(p.companyId())
                .orElseThrow(() -> new NotFoundException("Company not found"));
        return ResponseEntity.ok(ApiResponse.ok(c));
    }

    @GetMapping("/me/kyb")
    public ResponseEntity<ApiResponse<?>> kybStatus(@AuthenticationPrincipal AuthPrincipal p) {
        return ResponseEntity.ok(ApiResponse.ok(
                kybRepo.findFirstByCompanyIdOrderBySubmittedAtDesc(p.companyId()).orElse(null)));
    }
}
