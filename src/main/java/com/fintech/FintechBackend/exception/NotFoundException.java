package com.fintech.FintechBackend.exception;

import org.springframework.http.HttpStatus;

public class NotFoundException extends AppException {
    public NotFoundException(String m) {
        super(m, HttpStatus.NOT_FOUND);
    }
}
