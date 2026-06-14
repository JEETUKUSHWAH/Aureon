package com.fintech.FintechBackend.sessions;

import java.time.LocalDateTime;
import java.util.*;

public record TokenResponse(
        String  accessToken,
        String  refreshToken,
        UUID    memberId,
        UUID    companyId,
        String  role,
        String  companyStatus,
        String  kybStatus,
        Boolean rememberMe,
        LocalDateTime expiresAt           // ISO datetime so frontend knows when session ends
) {}


