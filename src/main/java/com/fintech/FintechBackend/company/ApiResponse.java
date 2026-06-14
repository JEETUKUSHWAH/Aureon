package com.fintech.FintechBackend.company;

public record ApiResponse<T>(boolean success, T data, String message, String error) {
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, data, null, null);
    }

    public static <T> ApiResponse<T> ok(T data, String msg) {
        return new ApiResponse<>(true, data, msg, null);
    }

    public static <T> ApiResponse<T> error(String err) {
        return new ApiResponse<>(false, null, null, err);
    }
}
