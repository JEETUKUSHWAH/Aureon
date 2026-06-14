package com.fintech.FintechBackend.payment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

record  InternationalRequest(
        @NotNull UUID fromAccountId,
        @NotBlank String counterpartyName,
        @NotBlank String counterpartyAccount,
        @NotNull @Positive BigDecimal amount,
        @NotBlank @Pattern(regexp = "USD|INR") String targetCurrency,
        String memo
) {
}
