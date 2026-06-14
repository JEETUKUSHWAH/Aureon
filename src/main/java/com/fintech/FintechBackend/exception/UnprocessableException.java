package com.fintech.FintechBackend.exception;


import org.springframework.http.*;


public class UnprocessableException  extends AppException { public UnprocessableException(String m) { super(m, HttpStatus.UNPROCESSABLE_ENTITY); } }



