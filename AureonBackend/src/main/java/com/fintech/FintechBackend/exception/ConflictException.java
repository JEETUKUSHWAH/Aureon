package com.fintech.FintechBackend.exception;

import org.springframework.http.HttpStatus;

public class ConflictException extends AppException {
    public ConflictException(String m) {
        super(m, HttpStatus.CONFLICT);
    }
}
