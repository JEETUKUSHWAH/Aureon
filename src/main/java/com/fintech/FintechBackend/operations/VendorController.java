package com.fintech.FintechBackend.operations;

import com.fintech.FintechBackend.company.ApiResponse;
import com.fintech.FintechBackend.entity.Vendor;
import com.fintech.FintechBackend.security.AuthPrincipal;
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
@RequestMapping("/api/vendors")
@RequiredArgsConstructor
class VendorController {
    private final VendorService vendorService;

    @PostMapping
    public ResponseEntity<ApiResponse<Vendor>> create(@Valid @RequestBody CreateVendorRequest req, @AuthenticationPrincipal AuthPrincipal p) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(vendorService.create(req, p.companyId())));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Vendor>>> list(@AuthenticationPrincipal AuthPrincipal p) {
        return ResponseEntity.ok(ApiResponse.ok(vendorService.list(p.companyId())));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id, @AuthenticationPrincipal AuthPrincipal p) {
        vendorService.delete(id, p.companyId());
        return ResponseEntity.ok(ApiResponse.ok(null, "Vendor removed"));
    }
}
