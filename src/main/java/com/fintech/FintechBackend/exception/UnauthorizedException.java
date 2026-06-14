package com.fintech.FintechBackend.exception;

import org.springframework.http.HttpStatus;

public class UnauthorizedException extends AppException {
    public UnauthorizedException(String m) {
        super(m, HttpStatus.UNAUTHORIZED);
    }
}
