package com.realhogoo.jsadmin.auth.jwt;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;

import java.time.Instant;
import java.util.Date;
import java.util.List;

public class JwtProvider {

    private final Algorithm alg;
    private final String issuer;
    private final long expSeconds;

    public JwtProvider(String secret, String issuer, long expSeconds) {
        this.alg = Algorithm.HMAC256(secret);
        this.issuer = issuer;
        this.expSeconds = expSeconds;
    }

    public String createToken(String userId, List<String> roles) {
        Instant now = Instant.now();
        Instant exp = now.plusSeconds(expSeconds);

        return JWT.create()
                .withIssuer(issuer)
                .withSubject(userId)
                .withIssuedAt(Date.from(now))
                .withExpiresAt(Date.from(exp))
                .withClaim("roles", roles)
                .sign(alg);
    }
}
