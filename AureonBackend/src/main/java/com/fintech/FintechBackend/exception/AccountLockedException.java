package com.fintech.FintechBackend.exception;

import org.springframework.http.HttpStatus;

public class AccountLockedException extends AppException {
    public AccountLockedException(String m) {
        super(m, HttpStatus.LOCKED);
    }
}
