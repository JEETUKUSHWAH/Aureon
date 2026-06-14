package com.fintech.FintechBackend.operations;

import com.fintech.FintechBackend.entity.TeamMember;
import com.fintech.FintechBackend.entity.Vendor;
import com.fintech.FintechBackend.exception.NotFoundException;
import com.fintech.FintechBackend.repository.TeamMemberRepository;
import com.fintech.FintechBackend.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
class VendorService {
    private final VendorRepository vendorRepo;
    private final TeamMemberRepository memberRepo;

    @Transactional
    public Vendor create(CreateVendorRequest req, UUID companyId) {
        TeamMember m = memberRepo.findById(companyId).orElse(null); // just get company ref
        Vendor v = Vendor.builder()
                .company(vendorRepo.findByCompanyId(companyId).stream().findFirst()
                        .map(Vendor::getCompany).orElseGet(() -> memberRepo.findByCompanyIdAndStatusNot(
                                companyId, TeamMember.MemberStatus.REMOVED).get(0).getCompany()))
                .name(req.name()).email(req.email()).bankName(req.bankName())
                .accountNumber(req.accountNumber()).routingNumber(req.routingNumber())
                .paymentMethod(req.paymentMethod() != null ? req.paymentMethod() : "ACH")
                .currency(req.currency() != null ? req.currency() : "USD")
                .address(req.address()).notes(req.notes()).build();
        return vendorRepo.save(v);
    }

    public List<Vendor> list(UUID companyId) {
        return vendorRepo.findByCompanyId(companyId);
    }

    @Transactional
    public void delete(UUID id, UUID companyId) {
        Vendor v = vendorRepo.findByIdAndCompanyId(id, companyId).orElseThrow(() -> new NotFoundException("Vendor not found"));
        vendorRepo.delete(v);
    }
}
