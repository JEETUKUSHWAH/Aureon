//package com.fintech.FintechBackend.passwordReset;
//
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Modifying;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;
//import org.springframework.stereotype.Repository;
//
//import java.time.LocalDateTime;
//import java.util.Optional;
//import java.util.UUID;
//
//@Repository
//public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {
//    Optional<PasswordResetToken> findByTokenAndUsedFalse(String token);
//
//    @Modifying
//    @Query("UPDATE PasswordResetToken t SET t.used = true WHERE t.member.id = :memberId AND t.used = false")
//    void invalidateAllByMemberId(@Param("memberId") UUID memberId);
//
//    @Modifying
//    @Query("DELETE FROM PasswordResetToken t WHERE t.expiresAt < :cutoff")
//    int deleteExpiredBefore(@Param("cutoff") LocalDateTime cutoff);
//}
