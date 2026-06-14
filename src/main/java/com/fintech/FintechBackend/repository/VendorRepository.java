package com.fintech.FintechBackend.repository;

import com.fintech.FintechBackend.entity.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, UUID> {
    List<Vendor> findByCompanyId(UUID companyId);

    Optional<Vendor> findByIdAndCompanyId(UUID id, UUID companyId);
}
