package com.fintech.FintechBackend.repository;

import com.fintech.FintechBackend.entity.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository public interface VirtualCardRepository extends JpaRepository<VirtualCard, UUID> {
    List<VirtualCard> findByCompanyId(UUID companyId);
    List<VirtualCard> findByIssuedToId(UUID memberId);
    Optional<VirtualCard> findByIdAndCompanyId(UUID id, UUID companyId);
}

