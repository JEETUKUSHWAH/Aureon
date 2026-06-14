package com.fintech.FintechBackend.security;

import java.util.UUID;

public record AuthPrincipal(UUID memberId, UUID companyId, String role) {
}
