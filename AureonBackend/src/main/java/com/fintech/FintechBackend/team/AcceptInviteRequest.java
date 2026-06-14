package com.fintech.FintechBackend.team;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

record AcceptInviteRequest(@NotBlank String inviteToken,
                           @NotBlank @Size(min = 8) String password) {
}
