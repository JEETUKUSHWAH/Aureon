package com.fintech.FintechBackend.operations;

import com.fintech.FintechBackend.company.ApiResponse;
import com.fintech.FintechBackend.entity.VirtualCard;
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
@RequestMapping("/api/cards")
@RequiredArgsConstructor
class CardController {
    private final CardService cardService;

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<ApiResponse<VirtualCard>> issue(@Valid @RequestBody IssueCardRequest req, @AuthenticationPrincipal AuthPrincipal p) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(cardService.issueCard(req, p.companyId())));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<VirtualCard>>> list(@AuthenticationPrincipal AuthPrincipal p) {
        return ResponseEntity.ok(ApiResponse.ok(cardService.listCards(p.companyId())));
    }

    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<List<VirtualCard>>> mine(@AuthenticationPrincipal AuthPrincipal p) {
        return ResponseEntity.ok(ApiResponse.ok(cardService.myCards(p.memberId())));
    }

    @PostMapping("/{id}/freeze")
    public ResponseEntity<ApiResponse<VirtualCard>> freeze(@PathVariable UUID id, @AuthenticationPrincipal AuthPrincipal p) {
        return ResponseEntity.ok(ApiResponse.ok(cardService.toggleFreeze(id, p.companyId(), true)));
    }

    @PostMapping("/{id}/unfreeze")
    public ResponseEntity<ApiResponse<VirtualCard>> unfreeze(@PathVariable UUID id, @AuthenticationPrincipal AuthPrincipal p) {
        return ResponseEntity.ok(ApiResponse.ok(cardService.toggleFreeze(id, p.companyId(), false)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<VirtualCard>> update(@PathVariable UUID id, @RequestBody UpdateCardRequest req, @AuthenticationPrincipal AuthPrincipal p) {
        return ResponseEntity.ok(ApiResponse.ok(cardService.updateCard(id, p.companyId(), req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<ApiResponse<Void>> cancel(@PathVariable UUID id, @AuthenticationPrincipal AuthPrincipal p) {
        cardService.cancelCard(id, p.companyId());
        return ResponseEntity.ok(ApiResponse.ok(null, "Card cancelled"));
    }
}
