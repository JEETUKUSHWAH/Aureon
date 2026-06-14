package com.fintech.FintechBackend.linkedaccounts;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

record VerifyRequest(
        @NotNull @DecimalMin("0.01") @DecimalMax("0.99") BigDecimal amount1,
        @NotNull @DecimalMin("0.01") @DecimalMax("0.99") BigDecimal amount2
) {}


