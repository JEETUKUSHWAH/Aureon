package com.fintech.FintechBackend.linkedaccounts;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.UUID;

record LinkAccountRequest(
        @NotBlank String bankName,
        @NotBlank String accountHolderName,
        @NotBlank @Pattern(regexp = "\\d{9}", message = "Routing number must be 9 digits") String routingNumber,
        @NotBlank @Size(min = 4, max = 17) String externalAccountNo,
        @NotBlank @Pattern(regexp = "CHECKING|SAVINGS") String accountType,
        @NotNull UUID platformAccountId    // which platform account to link for funding
) {
}
