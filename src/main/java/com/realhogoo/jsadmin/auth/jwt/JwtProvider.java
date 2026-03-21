package com.realhogoo.jsadmin.auth.jwt;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;

import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.UUID;

public class JwtProvider {

    private final Algorithm alg;
    private final String issuer;
    private final long expSeconds;
    private final JWTVerifier verifier;

    public JwtProvider(String secret, String issuer, long expSeconds) {
        this.alg = Algorithm.HMAC256(secret);
        this.issuer = issuer;
        this.expSeconds = expSeconds;
        this.verifier = JWT.require(alg)
            .withIssuer(issuer)
            .build();
    }

    public String createToken(String userId, String sessionId, List<String> roles) {
        Instant now = Instant.now();
        Instant exp = now.plusSeconds(expSeconds);
        String safeSessionId = (sessionId == null || sessionId.trim().isEmpty()) ? UUID.randomUUID().toString() : sessionId.trim();

        return JWT.create()
            .withIssuer(issuer)
            .withSubject(userId)
            .withClaim("session_id", safeSessionId)
            .withIssuedAt(Date.from(now))
            .withExpiresAt(Date.from(exp))
            .withClaim("roles", roles)
            .sign(alg);
    }

    public Instant getExpiresAt() {
        return Instant.now().plusSeconds(expSeconds);
    }

    public DecodedJWT verify(String token) {
        return verifier.verify(token);
    }
}
