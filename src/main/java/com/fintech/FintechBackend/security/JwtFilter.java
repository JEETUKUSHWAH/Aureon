package com.fintech.FintechBackend.security;

import com.fintech.FintechBackend.entity.TeamMember;
import com.fintech.FintechBackend.repository.TeamMemberRepository;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final TeamMemberRepository memberRepo;

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {

        String header = req.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            chain.doFilter(req, res);
            return;
        }

        try {
            String token = header.substring(7);
            UUID memberId = jwtUtil.memberId(token);
            UUID companyId = jwtUtil.companyId(token);
            String role = jwtUtil.role(token);

            memberRepo.findById(memberId).ifPresent(m -> {
                if (m.getStatus() == TeamMember.MemberStatus.ACTIVE) {
                    var auth = new UsernamePasswordAuthenticationToken(
                            new AuthPrincipal(memberId, companyId, role), null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + role)));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            });
        } catch (JwtException e) {
            log.debug("JWT rejected: {}", e.getMessage());
        }
        chain.doFilter(req, res);
    }
}
