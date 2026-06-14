package com.fintech.FintechBackend.operations;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

record ExportRequest(@NotBlank @Pattern(regexp = "QUICKBOOKS|XERO|CSV") String exportType,
                     @NotNull LocalDate fromDate, @NotNull LocalDate toDate) {
}
