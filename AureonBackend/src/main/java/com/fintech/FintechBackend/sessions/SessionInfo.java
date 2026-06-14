package com.fintech.FintechBackend.sessions;

import java.util.UUID;

public record SessionInfo(
        UUID id,
        String deviceName,
        java.net.InetAddress ipAddress,
        boolean rememberMe,
        String expiresAt,
        String lastActiveAt,
        boolean current             // is this the session making the request?
) {
}
