package com.fintech.FintechBackend.account;

import com.fintech.FintechBackend.entity.Account;
import jakarta.validation.constraints.NotNull;

record CreateAccountRequest(@NotNull Account.AccountType accountType, String nickname) {
}
