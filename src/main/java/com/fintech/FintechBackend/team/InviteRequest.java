package com.fintech.FintechBackend.team;

import com.fintech.FintechBackend.entity.TeamMember;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

record InviteRequest(@NotBlank @Email String email,
                     @NotBlank String firstName,
                     @NotBlank String lastName,
                     @NotNull TeamMember.MemberRole role) {
}
