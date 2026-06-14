package com.fintech.FintechBackend.payment;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.*;

record WireRequest(
        @NotNull UUID fromAccountId,
        @NotBlank String counterpartyName,
        @NotBlank String counterpartyAccount,
        @NotBlank String counterpartyRouting,
        @NotNull @Positive BigDecimal amount,
        String memo
) {}

