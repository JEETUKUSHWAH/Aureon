package com.fintech.FintechBackend.payment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

record  AchRequest(
        @NotNull UUID fromAccountId,
        @NotBlank String counterpartyName,
        @NotBlank String counterpartyAccount,
        @NotBlank String counterpartyRouting,
        @NotNull @Positive BigDecimal amount,
        boolean sameDay,
        String memo, String category
) {
}
