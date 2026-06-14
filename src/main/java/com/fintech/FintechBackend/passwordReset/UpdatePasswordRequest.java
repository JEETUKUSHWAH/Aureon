//package com.fintech.FintechBackend.passwordReset;
//
//
//import jakarta.validation.constraints.*;
//
//
//record UpdatePasswordRequest(
//        @NotBlank String currentPassword,
//        @NotBlank @Size(min = 8, message = "Password must be at least 8 characters")
//        @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
//                message = "Password must contain uppercase, lowercase, number and special character")
//        String newPassword
//) {}
//
//
//
