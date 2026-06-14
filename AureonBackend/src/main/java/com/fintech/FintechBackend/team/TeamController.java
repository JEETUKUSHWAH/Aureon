package com.fintech.FintechBackend.team;

import com.fintech.FintechBackend.company.ApiResponse;
import com.fintech.FintechBackend.entity.TeamMember;
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
@RequestMapping("/api/team")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TeamMember>>> list(@AuthenticationPrincipal AuthPrincipal p) {
        return ResponseEntity.ok(ApiResponse.ok(teamService.listMembers(p.companyId())));
    }

    @PostMapping("/invite")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<ApiResponse<TeamMember>> invite(
            @Valid @RequestBody InviteRequest req, @AuthenticationPrincipal AuthPrincipal p) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(teamService.invite(p.companyId(), req, p.memberId()),
                        "Invitation created. Share the inviteToken with the new member."));
    }

    @PostMapping("/accept-invite")
    public ResponseEntity<ApiResponse<TeamMember>> acceptInvite(@Valid @RequestBody AcceptInviteRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(teamService.acceptInvite(req)));
    }

    @PatchMapping("/{memberId}/role")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<ApiResponse<TeamMember>> updateRole(
            @PathVariable UUID memberId, @Valid @RequestBody UpdateRoleRequest req,
            @AuthenticationPrincipal AuthPrincipal p) {
        return ResponseEntity.ok(ApiResponse.ok(teamService.updateRole(p.companyId(), memberId, req, p.memberId())));
    }

    @DeleteMapping("/{memberId}")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<ApiResponse<Void>> remove(
            @PathVariable UUID memberId, @AuthenticationPrincipal AuthPrincipal p) {
        teamService.removeMember(p.companyId(), memberId, p.memberId());
        return ResponseEntity.ok(ApiResponse.ok(null, "Member removed"));
    }
}
