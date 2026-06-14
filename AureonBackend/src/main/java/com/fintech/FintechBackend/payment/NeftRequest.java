package com.fintech.FintechBackend.payment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;


record NeftRequest(
        @NotNull UUID fromAccountId,
        @NotBlank String counterpartyName,
        @NotBlank String counterpartyAccount,
        @NotBlank @Pattern(regexp = "^[A-Z]{4}0[A-Z0-9]{6}$",
                message = "Invalid IFSC code") String ifscCode,
        @NotNull @Positive BigDecimal amount,
        String memo, String category
) {}
