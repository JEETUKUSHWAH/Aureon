package com.fintech.FintechBackend.mockapi;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

/**
 * Mock KYB (Know Your Business) API — simulates a third-party business verification
 * provider like Persona or Alloy. No real API calls. 100% self-contained.
 * <p>
 * Rules:
 * EIN starting with "99" → REJECTED  (simulates a blocked business)
 * EIN starting with "11" → INFO_REQUIRED (simulates incomplete submission)
 * Everything else         → APPROVED after a short delay
 */
@RestController
@RequestMapping("/api/mock-kyb")
@RequiredArgsConstructor
@Slf4j
public class MockKybController {

    private final MockKybService kybService;

    @PostMapping("/verify")
    public MockKybResponse verify(@RequestBody MockKybRequest req) {
        return kybService.initiateVerification(req);
    }

    @GetMapping("/status/{reference}")
    public MockKybResponse status(@PathVariable String reference) {
        return kybService.getStatus(reference);
    }
}
