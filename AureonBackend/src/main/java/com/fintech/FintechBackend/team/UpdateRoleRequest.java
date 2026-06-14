package com.fintech.FintechBackend.team;

import com.fintech.FintechBackend.entity.TeamMember;

import jakarta.validation.constraints.*;

record UpdateRoleRequest(@NotNull TeamMember.MemberRole role) {}

