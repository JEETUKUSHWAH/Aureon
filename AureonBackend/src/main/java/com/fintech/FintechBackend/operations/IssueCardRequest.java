package com.fintech.FintechBackend.operations;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

record IssueCardRequest(
        @NotNull UUID accountId,
        @NotNull UUID issuedToMemberId,
        BigDecimal spendingLimit,
        String limitPeriod,
        String nickname
) {
}
