package com.fintech.FintechBackend.repository;

import com.fintech.FintechBackend.entity.Session;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SessionRepository extends JpaRepository<Session, UUID> {

    Optional<Session> findByRefreshTokenHashAndRevokedFalse(String hash);

    List<Session> findByMemberIdAndRevokedFalseOrderByLastActiveAtDesc(UUID memberId);

    @Modifying
    @Query("UPDATE Session s SET s.revoked = true WHERE s.member.id = :memberId")
    void revokeAllByMemberId(@Param("memberId") UUID memberId);

    @Modifying
    @Query("UPDATE Session s SET s.revoked = true WHERE s.id = :id AND s.member.id = :memberId")
    void revokeById(@Param("id") UUID id, @Param("memberId") UUID memberId);

    @Modifying
    @Query("UPDATE Session s SET s.revoked = true WHERE s.refreshTokenHash = :hash")
    void revokeByHash(@Param("hash") String hash);

    /** Cleanup job — purge expired sessions older than 7 days */
    @Modifying
    @Query("DELETE FROM Session s WHERE s.expiresAt < :cutoff")
    int deleteExpiredBefore(@Param("cutoff") LocalDateTime cutoff);

    @Modifying
    @Query("UPDATE Session s SET s.lastActiveAt = :now WHERE s.refreshTokenHash = :hash")
    void touchLastActive(@Param("hash") String hash, @Param("now") LocalDateTime now);
}