package com.fintech.FintechBackend.operations;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

record ReviewExpenseRequest(@NotBlank @Pattern(regexp = "APPROVED|REJECTED") String decision) {
}
