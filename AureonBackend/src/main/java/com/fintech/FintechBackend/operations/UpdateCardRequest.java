package com.fintech.FintechBackend.operations;

import java.math.BigDecimal;

record UpdateCardRequest(BigDecimal spendingLimit, String limitPeriod, String nickname) {
}
