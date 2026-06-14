package com.fintech.FintechBackend.linkedaccounts;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

record FundRequest(
        @NotNull @Positive BigDecimal amount,
        String memo
) {
}
