package com.fintech.FintechBackend.payment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

record CheckRequest(
        @NotNull UUID fromAccountId,
        @NotBlank String payeeName,
        @NotBlank String mailingAddress,
        @NotNull @Positive BigDecimal amount,
        String memo
) {
}
