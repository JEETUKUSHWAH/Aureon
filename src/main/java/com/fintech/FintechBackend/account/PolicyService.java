package com.fintech.FintechBackend.account;

import com.fintech.FintechBackend.entity.*;
import com.fintech.FintechBackend.repository.*;
import com.fintech.FintechBackend.supportEntities.ApprovalPolicy;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service @RequiredArgsConstructor
public class PolicyService {
    private final ApprovalPolicyRepository policyRepo;
    private final TeamMemberRepository memberRepo;

    @Transactional
    public ApprovalPolicy create(CreatePolicyRequest req, UUID companyId) {
        return policyRepo.save(ApprovalPolicy.builder()
                .company(memberRepo.findByCompanyIdAndStatusNot(companyId, TeamMember.MemberStatus.REMOVED)
                        .get(0).getCompany())
                .name(req.name()).paymentRail(req.paymentRail())
                .amountAbove(req.amountAbove())
                .requiresRole(req.requiresRole() != null ? req.requiresRole() : "ADMIN")
                .numApprovers(req.numApprovers() != null ? req.numApprovers() : 1)
                .build());
    }

    public List<ApprovalPolicy> list(UUID companyId) { return policyRepo.findByCompanyIdAndActiveTrue(companyId); }

    @Transactional
    public void deactivate(UUID policyId, UUID companyId) {
        policyRepo.findById(policyId).ifPresent(p -> { p.setActive(false); policyRepo.save(p); });
    }
}

