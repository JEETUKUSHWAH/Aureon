package com.fintech.FintechBackend.operations;

import com.fintech.FintechBackend.company.ApiResponse;
import com.fintech.FintechBackend.entity.Invoice;
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
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
class InvoiceController {
    private final InvoiceService invoiceService;

    @PostMapping
    public ResponseEntity<ApiResponse<Invoice>> create(@Valid @RequestBody CreateInvoiceRequest req, @AuthenticationPrincipal AuthPrincipal p) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(invoiceService.create(req, p.companyId(), p.memberId())));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Invoice>>> list(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size, @AuthenticationPrincipal AuthPrincipal p) {
        return ResponseEntity.ok(ApiResponse.ok(invoiceService.list(p.companyId(), page, size)));
    }

    @PostMapping("/{id}/send")
    public ResponseEntity<ApiResponse<Invoice>> send(@PathVariable UUID id, @AuthenticationPrincipal AuthPrincipal p) {
        return ResponseEntity.ok(ApiResponse.ok(invoiceService.send(id, p.companyId())));
    }

    @PostMapping("/{id}/mark-paid")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN','BOOKKEEPER')")
    public ResponseEntity<ApiResponse<Invoice>> markPaid(@PathVariable UUID id, @AuthenticationPrincipal AuthPrincipal p) {
        return ResponseEntity.ok(ApiResponse.ok(invoiceService.markPaid(id, p.companyId())));
    }
}
