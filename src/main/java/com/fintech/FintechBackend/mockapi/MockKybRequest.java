package com.fintech.FintechBackend.mockapi;

public record   MockKybRequest(String ein, String legalName, String businessType,
                      String incorporationState, String kybVerificationId) {
}
