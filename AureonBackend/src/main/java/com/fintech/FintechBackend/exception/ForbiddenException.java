package com.fintech.FintechBackend.exception;

import org.springframework.http.HttpStatus;

public class ForbiddenException extends AppException {
    public ForbiddenException(String m) {
        super(m, HttpStatus.FORBIDDEN);
    }
}
