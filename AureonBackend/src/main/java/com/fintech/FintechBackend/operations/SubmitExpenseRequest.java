package com.fintech.FintechBackend.operations;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

record SubmitExpenseRequest(@NotNull @Positive BigDecimal amount, String currency,
                            @NotBlank String merchantName, String category, String description,
                            String receiptUrl, boolean reimbursable) {
}
