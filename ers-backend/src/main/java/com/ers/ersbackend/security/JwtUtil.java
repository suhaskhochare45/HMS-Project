package com.ers.ersbackend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    // ✅ MUST be at least 32 characters
    private static final String SECRET = "mysecretkeymysecretkeymysecretkey12";

    // ✅ Generate signing key
    private Key getSignKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    // ✅ Generate JWT Token
    public String generateToken(String email, String role) {
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role) // ✅ ADD ROLE
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60))
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // ✅ Extract username/email from token
    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    // ✅ Extract all claims
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignKey()) // SAME KEY used for signing
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // ✅ Validate token
    public boolean validateToken(String token, String email) {
        final String username = extractUsername(token);
        return (username.equals(email) && !isTokenExpired(token));
    }

    // ✅ Check expiration
    private boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }
    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }
}