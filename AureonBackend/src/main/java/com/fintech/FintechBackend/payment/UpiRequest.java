package com.fintech.FintechBackend.payment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

record UpiRequest(
        @NotNull UUID fromAccountId,
        @NotBlank @Pattern(regexp = "^[a-zA-Z0-9.\\-_]{2,}@[a-zA-Z]{3,}$",
                message = "Invalid UPI ID format") String upiId,
        @NotBlank String counterpartyName,
        @NotNull @Positive BigDecimal amount,
        String memo, String category
) {}
