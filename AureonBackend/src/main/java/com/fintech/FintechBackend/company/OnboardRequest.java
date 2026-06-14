package com.fintech.FintechBackend.company;

import com.fintech.FintechBackend.entity.Company;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

record OnboardRequest(
        @NotBlank String legalName,
        @NotBlank String displayName,
        @NotBlank String ein,
        @NotNull Company.BusinessType businessType,
        String industry, String website, String phone,
        @NotBlank String addressLine1, String addressLine2,
        @NotBlank String city, @NotBlank String state,
        @NotBlank @Size(min = 2, max = 2) String country,
        @NotBlank String postalCode,
        // Owner account
        @NotBlank @Email String ownerEmail,
        @NotBlank @Size(min = 8) String ownerPassword,
        @NotBlank String ownerFirstName,
        @NotBlank String ownerLastName,
        String ownerPhone,
        // KYB docs
        String docArticlesUrl,
        String docEinLetterUrl,
        String incorporationState,
        LocalDate incorporationDate
) {
}
