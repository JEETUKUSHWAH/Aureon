package com.fintech.FintechBackend.operations;

import com.fintech.FintechBackend.entity.LineItem;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

record CreateInvoiceRequest(
        @NotNull UUID accountId, @NotBlank String clientName, @NotBlank String clientEmail,
        String clientAddress, @NotNull List<LineItem> lineItems, // JSON array
        @NotNull BigDecimal subtotal, BigDecimal taxRate,
        @NotNull BigDecimal totalAmount, String currency, LocalDate dueDate, String notes
) {
}
