package com.fintech.FintechBackend.mockapi;

import com.fintech.FintechBackend.entity.*;
import com.fintech.FintechBackend.repository.*;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MockKybService {

    private final KybVerificationRepository kybRepo;
    private final CompanyRepository companyRepo;

    @Value("${app.mock-kyb.auto-approve-delay-ms:2000}")
    private long approveDelayMs;

    public MockKybResponse initiateVerification(MockKybRequest req) {
        String reference = "KYB-" + System.currentTimeMillis();

        // Determine outcome based on EIN prefix (mock rule)
        String outcome;
        String reason = null;

        if (req.ein() != null && req.ein().startsWith("99")) {
            outcome = "REJECTED";
            reason = "Business flagged in regulatory database";
        } else if (req.ein() != null && req.ein().startsWith("11")) {
            outcome = "INFO_REQUIRED";
            reason = "Additional documentation required: proof of address";
        } else {
            outcome = "APPROVED";
        }

        // Async: update verification record after simulated processing delay
        processAsync(req.kybVerificationId(), reference, outcome, reason);

        log.info("Mock KYB initiated: ref={} ein={} outcome={}", reference, req.ein(), outcome);
        return new MockKybResponse(reference, "UNDER_REVIEW", null,
                "Verification submitted. Reference: " + reference);
    }

    public MockKybResponse getStatus(String reference) {
        // The reference could be the KYB-XXXXX reference (after processing)
        // OR the verification UUID (before processing completes).
        // Try both to avoid "NOT_FOUND" during the 2-second async window.

        return kybRepo.findAll().stream()
                .filter(k -> reference.equals(k.getMockReference())
                        || (k.getId() != null && reference.equals(k.getId().toString())))
                .findFirst()
                .map(k -> new MockKybResponse(
                        k.getMockReference() != null ? k.getMockReference() : reference,
                        k.getStatus().name(),
                        k.getRejectionReason(),
                        null))
                .orElse(new MockKybResponse(reference, "NOT_FOUND", null, "Reference not found"));
    }

    @Async
    @Transactional
    public void processAsync(String kybVerificationId, String reference, String outcome, String reason) {
        try {
            // Simulate real-world KYB processing time (default: 2 days)
            // In production, this would be replaced by actual calls to KYB provider APIs
            // (e.g., Stripe Identity, Persona, Onfido) with webhook callbacks
            Thread.sleep(approveDelayMs);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        if (kybVerificationId == null) return;

        kybRepo.findById(UUID.fromString(kybVerificationId)).ifPresent(kyb -> {
            kyb.setMockReference(reference);
            kyb.setReviewedAt(LocalDateTime.now());

            KybVerification.KybVerificationStatus status =
                    KybVerification.KybVerificationStatus.valueOf(outcome);
            kyb.setStatus(status);

            if (reason != null) kyb.setRejectionReason(reason);
            kybRepo.save(kyb);

            // Update company KYB status
            Company.KybStatus companyKybStatus = switch (outcome) {
                case "APPROVED"       -> Company.KybStatus.APPROVED;
                case "REJECTED"       -> Company.KybStatus.REJECTED;
                case "INFO_REQUIRED"  -> Company.KybStatus.INFO_REQUIRED;
                default               -> Company.KybStatus.UNDER_REVIEW;
            };

            Company company = kyb.getCompany();
            company.setKybStatus(companyKybStatus);
            if (outcome.equals("APPROVED")) {
                company.setStatus(Company.CompanyStatus.ACTIVE);
                company.setKybReference(reference);
            }
            companyRepo.save(company);

            log.info("Mock KYB processed: companyId={} outcome={} ref={}",
                    company.getId(), outcome, reference);
        });
    }
}