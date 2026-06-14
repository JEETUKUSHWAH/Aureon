package com.fintech.FintechBackend.payment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

record ApprovalActionRequest(
        @NotBlank @Pattern(regexp = "APPROVE|REJECT") String action,
        String notes
) {
}
