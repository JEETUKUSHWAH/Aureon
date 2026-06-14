package com.fintech.FintechBackend.account;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

record CreatePolicyRequest(@NotBlank String name, String paymentRail,
                           @NotNull @Positive BigDecimal amountAbove,
                           String requiresRole, Integer numApprovers) {
}
