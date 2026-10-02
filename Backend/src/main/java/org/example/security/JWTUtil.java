package org.example.security;

import java.security.Key;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JWTUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    // =============================================================
    // SIGNING KEY
    // =============================================================
    private Key getSigningKey() {

        return Keys.hmacShaKeyFor(
                secret.getBytes()
        );
    }

    // =============================================================
    // GENERATE TOKEN
    // =============================================================
    public String generateToken(
            String email,
            String role
    ) {

        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(
                        new Date(
                                System.currentTimeMillis()
                                        + expiration
                        )
                )
                .signWith(
                        getSigningKey(),
                        SignatureAlgorithm.HS256
                )
                .compact();
    }

    // =============================================================
    // EXTRACT EMAIL
    // =============================================================
    public String extractEmail(
            String token
    ) {

        Claims claims =
                Jwts.parserBuilder()
                        .setSigningKey(
                                getSigningKey()
                        )
                        .build()
                        .parseClaimsJws(token)
                        .getBody();

        return claims.getSubject();
    }

    // =============================================================
    // EXTRACT ROLE
    // =============================================================
    public String extractRole(
            String token
    ) {

        Claims claims =
                Jwts.parserBuilder()
                        .setSigningKey(
                                getSigningKey()
                        )
                        .build()
                        .parseClaimsJws(token)
                        .getBody();

        return claims.get(
                "role",
                String.class
        );
    }

    // =============================================================
    // VALIDATE TOKEN
    // =============================================================
    public boolean validateToken(
            String token
    ) {

        try {

            extractEmail(token);

            return true;

        } catch (Exception e) {

            return false;
        }
    }
}