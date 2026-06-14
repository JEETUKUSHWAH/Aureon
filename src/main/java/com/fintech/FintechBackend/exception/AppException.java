package com.fintech.FintechBackend.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class AppException extends RuntimeException {
    private final HttpStatus status;

    public AppException(String msg, HttpStatus s) {
        super(msg);
        this.status = s;
    }

}
