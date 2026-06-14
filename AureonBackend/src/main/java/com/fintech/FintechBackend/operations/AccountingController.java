package com.fintech.FintechBackend.operations;

import com.fintech.FintechBackend.company.ApiResponse;
import com.fintech.FintechBackend.security.AuthPrincipal;
import com.fintech.FintechBackend.supportEntities.AccountingExport;
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
@RequestMapping("/api/accounting")
@RequiredArgsConstructor
class AccountingController {
    private final AccountingService accountingService;

    @PostMapping("/exports")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN','BOOKKEEPER')")
    public ResponseEntity<ApiResponse<AccountingExport>> requestExport(@Valid @RequestBody ExportRequest req, @AuthenticationPrincipal AuthPrincipal p) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(accountingService.requestExport(req, p.companyId(), p.memberId())));
    }

    @GetMapping("/exports")
    public ResponseEntity<ApiResponse<List<AccountingExport>>> list(@AuthenticationPrincipal AuthPrincipal p) {
        return ResponseEntity.ok(ApiResponse.ok(accountingService.listExports(p.companyId())));
    }

    @GetMapping("/exports/{id}/download")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN','BOOKKEEPER')")
    public ResponseEntity<String> download(@PathVariable UUID id, @AuthenticationPrincipal AuthPrincipal p) {
        String csv = accountingService.generateCsv(id, p.companyId());
        return ResponseEntity.ok().header("Content-Type", "text/csv")
                .header("Content-Disposition", "attachment; filename=ledger-" + id + ".csv").body(csv);
    }
}
