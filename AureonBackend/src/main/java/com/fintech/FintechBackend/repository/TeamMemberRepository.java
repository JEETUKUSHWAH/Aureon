package com.fintech.FintechBackend.repository;

import com.fintech.FintechBackend.entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, UUID> {
    Optional<TeamMember> findByEmail(String email);

    Optional<TeamMember> findByEmailAndCompanyId(String email, UUID companyId);

    List<TeamMember> findByCompanyIdAndStatusNot(UUID companyId, TeamMember.MemberStatus status);

    Optional<TeamMember> findByInviteToken(String token);

    boolean existsByEmailAndCompanyId(String email, UUID companyId);
}
