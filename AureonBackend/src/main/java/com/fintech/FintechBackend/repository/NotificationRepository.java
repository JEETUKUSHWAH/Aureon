package com.fintech.FintechBackend.repository;

import com.fintech.FintechBackend.entity.Notification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByMemberIdOrderByCreatedAtDesc(UUID memberId, Pageable pageable);

    long countByMemberIdAndReadFalse(UUID memberId);

    @Modifying
    @Query("UPDATE Notification n SET n.read=true WHERE n.member.id=:id")
    void markAllRead(@Param("id") UUID id);
}
