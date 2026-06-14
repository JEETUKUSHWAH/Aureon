package com.fintech.FintechBackend.linkedaccounts;

import java.time.LocalDateTime;
import java.util.UUID;

record LinkedAccountResponse(
        UUID id,
        String bankName,
        String accountHolderName,
        String routingNumber,
        String maskedAccountNo,
        String accountType,
        String currency,
        String status,
        int attemptsRemaining,
        LocalDateTime microExpiresAt,
        LocalDateTime verifiedAt,
        LocalDateTime createdAt
) {
}
