package com.fintech.FintechBackend.team;

import com.fintech.FintechBackend.entity.TeamMember;
import com.fintech.FintechBackend.exception.BadRequestException;
import com.fintech.FintechBackend.exception.ConflictException;
import com.fintech.FintechBackend.exception.ForbiddenException;
import com.fintech.FintechBackend.exception.NotFoundException;
import com.fintech.FintechBackend.repository.TeamMemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
class TeamService {

    private final TeamMemberRepository memberRepo;
    private final PasswordEncoder encoder;

    public List<TeamMember> listMembers(UUID companyId) {
        return memberRepo.findByCompanyIdAndStatusNot(companyId, TeamMember.MemberStatus.REMOVED);
    }

    @Transactional
    public TeamMember invite(UUID companyId, InviteRequest req, UUID invitedBy) {
        if (memberRepo.existsByEmailAndCompanyId(req.email(), companyId)) {
            throw new ConflictException("User already exists in this company");
        }

        // In production: send email with token. Here: return token in response.
        String token = UUID.randomUUID().toString().replace("-", "");

        TeamMember member = TeamMember.builder()
                .company(memberRepo.getReferenceById(invitedBy).getCompany())
                .email(req.email()).firstName(req.firstName()).lastName(req.lastName())
                .role(req.role()).status(TeamMember.MemberStatus.INVITED)
                .inviteToken(token).inviteExpires(LocalDateTime.now().plusDays(7))
                .build();

        member = memberRepo.save(member);
        log.info("Member invited: {} to company {}", req.email(), companyId);
        return member;
    }

    @Transactional
    public TeamMember acceptInvite(AcceptInviteRequest req) {
        TeamMember member = memberRepo.findByInviteToken(req.inviteToken())
                .orElseThrow(() -> new NotFoundException("Invalid invite token"));

        if (member.getInviteExpires() != null && member.getInviteExpires().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Invite token has expired");
        }

        member.setPasswordHash(encoder.encode(req.password()));
        member.setStatus(TeamMember.MemberStatus.ACTIVE);
        member.setInviteToken(null);
        member.setInviteExpires(null);
        return memberRepo.save(member);
    }

    @Transactional
    public TeamMember updateRole(UUID companyId, UUID memberId, UpdateRoleRequest req, UUID actorId) {
        TeamMember actor = memberRepo.findById(actorId).orElseThrow();
        if (actor.getRole() != TeamMember.MemberRole.OWNER && actor.getRole() != TeamMember.MemberRole.ADMIN) {
            throw new ForbiddenException("Only OWNER or ADMIN can change roles");
        }
        TeamMember target = memberRepo.findById(memberId).orElseThrow(() -> new NotFoundException("Member not found"));
        if (!target.getCompany().getId().equals(companyId)) throw new ForbiddenException("Not in your company");
        if (target.getRole() == TeamMember.MemberRole.OWNER) throw new ForbiddenException("Cannot change OWNER role");

        target.setRole(req.role());
        return memberRepo.save(target);
    }

    @Transactional
    public void removeMember(UUID companyId, UUID memberId, UUID actorId) {
        TeamMember target = memberRepo.findById(memberId).orElseThrow(() -> new NotFoundException("Member not found"));
        if (!target.getCompany().getId().equals(companyId)) throw new ForbiddenException("Not in your company");
        if (target.getId().equals(actorId)) throw new BadRequestException("Cannot remove yourself");
        if (target.getRole() == TeamMember.MemberRole.OWNER)
            throw new ForbiddenException("Cannot remove company owner");
        target.setStatus(TeamMember.MemberStatus.REMOVED);
        memberRepo.save(target);
    }
}
