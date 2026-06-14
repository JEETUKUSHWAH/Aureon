package com.fintech.FintechBackend.operations;

import com.fintech.FintechBackend.company.ApiResponse;
import com.fintech.FintechBackend.entity.Expense;
import com.fintech.FintechBackend.security.AuthPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
class ExpenseController {
    private final ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<ApiResponse<Expense>> submit(@Valid @RequestBody SubmitExpenseRequest req, @AuthenticationPrincipal AuthPrincipal p) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(expenseService.submit(req, p.companyId(), p.memberId())));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Expense>>> list(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size, @AuthenticationPrincipal AuthPrincipal p) {
        return ResponseEntity.ok(ApiResponse.ok(expenseService.list(p.companyId(), page, size)));
    }

    @PostMapping("/{id}/review")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN','BOOKKEEPER')")
    public ResponseEntity<ApiResponse<Expense>> review(@PathVariable UUID id, @Valid @RequestBody ReviewExpenseRequest req, @AuthenticationPrincipal AuthPrincipal p) {
        return ResponseEntity.ok(ApiResponse.ok(expenseService.review(id, req, p.companyId(), p.memberId())));
    }
}
