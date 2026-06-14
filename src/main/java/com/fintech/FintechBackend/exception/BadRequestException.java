package com.fintech.FintechBackend.exception;

import org.springframework.http.HttpStatus;

public class BadRequestException extends AppException {
    public BadRequestException(String m) {
        super(m, HttpStatus.BAD_REQUEST);
    }
}
