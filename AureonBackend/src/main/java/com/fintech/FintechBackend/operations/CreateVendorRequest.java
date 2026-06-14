package com.fintech.FintechBackend.operations;

import jakarta.validation.constraints.NotBlank;

record CreateVendorRequest(@NotBlank String name, String email, String bankName,
                           String accountNumber, String routingNumber, String paymentMethod,
                           String currency, String address, String notes) {
}
