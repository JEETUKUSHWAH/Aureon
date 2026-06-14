package com.fintech.FintechBackend.repository;

import com.fintech.FintechBackend.entity.KybVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface KybVerificationRepository extends JpaRepository<KybVerification, UUID> {
    Optional<KybVerification> findFirstByCompanyIdOrderBySubmittedAtDesc(UUID companyId);
}
