// 파일: src/main/java/com/realhogoo/jsadmin/auth/jwt/JwtProvider.java

package com.realhogoo.jsadmin.auth.jwt;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;

import java.time.Instant;
import java.util.Date;
import java.util.List;

public class JwtProvider {

    private final Algorithm alg;
    private final String issuer;
    private final long expSeconds;

    private final JWTVerifier verifier; // 추가

    public JwtProvider(String secret, String issuer, long expSeconds) {
        this.alg = Algorithm.HMAC256(secret);
        this.issuer = issuer;
        this.expSeconds = expSeconds;

        // 추가: 서명/issuer/exp 검증
        this.verifier = JWT.require(alg)
                .withIssuer(issuer)
                .build();
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

    // 추가: 토큰 검증 + 디코딩(만료/서명 오류 시 예외 발생)
    public DecodedJWT verify(String token) {
        return verifier.verify(token);
    }
}
