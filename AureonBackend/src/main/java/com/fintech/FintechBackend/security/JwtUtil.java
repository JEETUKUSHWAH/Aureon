package com.fintech.FintechBackend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;
import java.util.UUID;
@Component
@Slf4j
public class JwtUtil {

    private final SecretKey key;
    private final long accessExpiry;
    private final long refreshExpiry;

    public JwtUtil(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.access-token-expiry-ms}") long accessExpiry,
            @Value("${app.jwt.refresh-token-expiry-ms}") long refreshExpiry) {
        this.key = Keys.hmacShaKeyFor(
                Base64.getEncoder().encode(secret.getBytes()));
        this.accessExpiry = accessExpiry;
        this.refreshExpiry = refreshExpiry;
    }

    public String generateAccess(UUID memberId, UUID companyId, String role) {
        return Jwts.builder()
                .subject(memberId.toString())
                .claim("companyId", companyId.toString())
                .claim("role", role)
                .claim("type", "access")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessExpiry))
                .signWith(key).compact();
    }

    public String generateRefresh(UUID memberId) {
        return Jwts.builder()
                .subject(memberId.toString())
                .claim("type", "refresh")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshExpiry))
                .signWith(key).compact();
    }

    public Claims parse(String token) {
        return Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(token).getPayload();
    }

    public UUID memberId(String token) {
        return UUID.fromString(parse(token).getSubject());
    }

    public UUID companyId(String token) {
        return UUID.fromString(parse(token).get("companyId", String.class));
    }

    public String role(String token) {
        return parse(token).get("role", String.class);
    }

    public long getRefreshExpiry() {
        return refreshExpiry;
    }
}
