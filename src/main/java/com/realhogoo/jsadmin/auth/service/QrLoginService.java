package com.realhogoo.jsadmin.auth.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.realhogoo.jsadmin.access.service.AccessService;
import com.realhogoo.jsadmin.api.ApiResponse;
import com.realhogoo.jsadmin.auth.dto.LoginUser;
import com.realhogoo.jsadmin.auth.mapper.AuthMapper;
import com.realhogoo.jsadmin.auth.mapper.QrLoginMapper;
import com.realhogoo.jsadmin.auth.web.AuthCookieSupport;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.net.InetAddress;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Collections;
import java.util.Date;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

@Service
public class QrLoginService {
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int TOKEN_BYTES = 32;
    private static final int QR_SIZE = 260;

    private final QrLoginMapper qrLoginMapper;
    private final AuthMapper authMapper;
    private final AuthService authService;
    private final AccessService accessService;
    private final long ttlSeconds;
    private final int maxCreatesPerMinute;
    private final int cleanupRetentionDays;
    private final String configuredPublicBaseUrl;
    private final String tokenSecret;

    public QrLoginService(
        QrLoginMapper qrLoginMapper,
        AuthMapper authMapper,
        AuthService authService,
        AccessService accessService,
        @Value("${auth.qr-login.ttl-seconds:180}") long ttlSeconds,
        @Value("${auth.qr-login.create-rate-limit.max-per-minute:60}") int maxCreatesPerMinute,
        @Value("${auth.qr-login.cleanup-retention-days:30}") int cleanupRetentionDays,
        @Value("${auth.qr-login.token-secret:}") String tokenSecret,
        @Value("${app.public-base-url:http://localhost:8081}") String configuredPublicBaseUrl
    ) {
        this.qrLoginMapper = qrLoginMapper;
        this.authMapper = authMapper;
        this.authService = authService;
        this.accessService = accessService;
        this.ttlSeconds = Math.max(30L, Math.min(ttlSeconds, 300L));
        this.maxCreatesPerMinute = Math.max(3, maxCreatesPerMinute);
        this.cleanupRetentionDays = Math.max(1, cleanupRetentionDays);
        this.tokenSecret = tokenSecret == null ? "" : tokenSecret.trim();
        this.configuredPublicBaseUrl = normalizeBaseUrl(configuredPublicBaseUrl);
    }

    @Transactional
    public Map<String, Object> create(HttpServletRequest request) {
        ensureCreateAllowed(request);
        String requestId = UUID.randomUUID().toString();
        String token = randomToken();
        Instant expiresAt = Instant.now().plusSeconds(ttlSeconds);
        String approvalUrl = publicBaseUrl(request) + "/service-login-page.do?qr_token=" + token;

        Map<String, Object> param = new HashMap<String, Object>();
        param.put("request_id", requestId);
        param.put("request_token_hash", hashToken(token));
        param.put("client_ip", extractClientIp(request));
        param.put("user_agent", trimToNull(header(request, "User-Agent"), 500));
        param.put("expires_at", Date.from(expiresAt));
        qrLoginMapper.insertQrLoginRequest(param);

        Map<String, Object> data = new HashMap<String, Object>();
        data.put("request_id", requestId);
        data.put("expires_at", expiresAt.toEpochMilli());
        data.put("approval_url", approvalUrl);
        data.put("qr_svg", qrSvg(approvalUrl));
        return data;
    }

    public Map<String, Object> status(String requestId, HttpServletRequest request) {
        Map<String, Object> row = requestRow(requestId);
        ensureSameClient(row, request);
        expireIfNeeded(row);
        row = requestRow(requestId);
        return statusData(row, false);
    }

    @Transactional
    public Map<String, Object> approve(String token, HttpServletRequest request, HttpServletResponse response) {
        String tokenHash = hashToken(requiredText(token, "token"));
        Map<String, Object> row = qrLoginMapper.selectQrLoginRequestByTokenHash(tokenHash);
        if (row == null || row.isEmpty()) {
            throw new IllegalArgumentException("QR 로그인 요청을 찾을 수 없습니다.");
        }
        if (isExpired(row)) {
            qrLoginMapper.expireQrLoginRequest(stringValue(row.get("request_id")));
            throw new IllegalArgumentException("QR 로그인 요청이 만료되었습니다.");
        }
        String status = stringValue(row.get("status_cd"));
        if (!"WAITING".equalsIgnoreCase(status)) {
            throw new IllegalArgumentException("이미 처리된 QR 로그인 요청입니다.");
        }

        String userId = stringValue(request.getAttribute("user_id"));
        String sessionId = stringValue(request.getAttribute("session_id"));
        if (userId == null || userId.isEmpty() || sessionId == null || sessionId.isEmpty()) {
            throw new IllegalArgumentException("모바일 로그인이 필요합니다.");
        }
        LoginUser user = authMapper.selectUserForLogin(userId);
        if (user == null) {
            throw new IllegalArgumentException("사용자 정보를 찾을 수 없습니다.");
        }

        Map<String, Object> param = new HashMap<String, Object>();
        param.put("request_token_hash", tokenHash);
        param.put("approved_user_seq", user.getUserSeq());
        param.put("approved_login_id", user.getUserId());
        param.put("approved_user_nm", user.getUserNm());
        param.put("approved_session_id", null);
        param.put("mobile_session_id", sessionId);
        int updated = qrLoginMapper.approveQrLoginRequest(param);
        if (updated <= 0) {
            accessService.recordLoginHistory(user, user.getUserId(), false, "QR_APPROVE_FAILED", null, request);
            throw new IllegalArgumentException("QR 로그인 승인에 실패했습니다.");
        }

        authService.revokeRefreshTokensBySessionId(sessionId, userId);
        accessService.logout(sessionId, userId, request);
        AuthCookieSupport.clearAuthCookies(request, response);
        accessService.recordLoginHistory(user, user.getUserId(), true, "QR_APPROVED_MOBILE_EXPIRED", null, request);

        return Collections.singletonMap("approved", true);
    }

    @Transactional
    public ApiResponse<Map<String, Object>> consume(String requestId, HttpServletRequest request) {
        Map<String, Object> row = requestRow(requestId);
        if (!isSameClient(row, request)) {
            accessService.recordLoginHistory(null, null, false, "QR_CONSUME_CLIENT_MISMATCH", null, request);
            return ApiResponse.fail("FORBIDDEN", "QR 로그인 요청을 생성한 브라우저에서만 처리할 수 있습니다.", null, request);
        }
        if (isExpired(row)) {
            qrLoginMapper.expireQrLoginRequest(requestId);
            accessService.recordLoginHistory(null, null, false, "QR_CONSUME_EXPIRED", null, request);
            return ApiResponse.fail("EXPIRED", "QR 로그인 요청이 만료되었습니다.", statusData(row, false), request);
        }
        String status = stringValue(row.get("status_cd"));
        if (!"APPROVED".equalsIgnoreCase(status)) {
            accessService.recordLoginHistory(null, null, false, "QR_CONSUME_NOT_APPROVED", null, request);
            return ApiResponse.fail("NOT_APPROVED", "아직 승인되지 않았습니다.", statusData(row, false), request);
        }
        String loginId = stringValue(row.get("approved_login_id"));
        int consumed = qrLoginMapper.consumeQrLoginRequest(requestId, loginId);
        if (consumed <= 0) {
            accessService.recordLoginHistory(null, loginId, false, "QR_CONSUME_ALREADY_USED", null, request);
            return ApiResponse.fail("ALREADY_USED", "이미 사용된 QR 로그인 요청입니다.", null, request);
        }
        return authService.issueQrLogin(loginId, request);
    }

    private Map<String, Object> requestRow(String requestId) {
        String id = requiredText(requestId, "request_id");
        Map<String, Object> row = qrLoginMapper.selectQrLoginRequestById(id);
        if (row == null || row.isEmpty()) {
            throw new IllegalArgumentException("QR 로그인 요청을 찾을 수 없습니다.");
        }
        return row;
    }

    private void expireIfNeeded(Map<String, Object> row) {
        if (row != null && isExpired(row) && "WAITING".equalsIgnoreCase(stringValue(row.get("status_cd")))) {
            qrLoginMapper.expireQrLoginRequest(stringValue(row.get("request_id")));
        }
    }

    private void ensureSameClient(Map<String, Object> row, HttpServletRequest request) {
        if (request != null && !isSameClient(row, request)) {
            throw new IllegalArgumentException("QR 로그인 요청을 찾을 수 없습니다.");
        }
    }

    private boolean isSameClient(Map<String, Object> row, HttpServletRequest request) {
        if (row == null || request == null) {
            return false;
        }
        String createdIp = stringValue(row.get("client_ip"));
        String createdAgent = stringValue(row.get("user_agent"));
        String currentIp = extractClientIp(request);
        String currentAgent = trimToNull(header(request, "User-Agent"), 500);
        return safeEquals(createdIp, currentIp) && safeEquals(createdAgent, currentAgent);
    }

    private boolean safeEquals(String left, String right) {
        return left == null ? right == null : left.equals(right);
    }

    private void ensureCreateAllowed(HttpServletRequest request) {
        String key = stringValue(extractClientIp(request));
        if (key == null) {
            key = "unknown";
        }
        int recentCount = qrLoginMapper.countRecentQrLoginRequests(key, 60L);
        if (recentCount >= maxCreatesPerMinute) {
            throw new IllegalStateException("QR 로그인 요청이 너무 많습니다. 잠시 후 다시 시도하세요.");
        }
    }

    @Scheduled(cron = "${auth.qr-login.cleanup-cron:0 25 3 * * *}")
    @Transactional
    public void cleanupOldRequests() {
        qrLoginMapper.deleteOldQrLoginRequests(cleanupRetentionDays);
    }

    private Map<String, Object> statusData(Map<String, Object> row, boolean includeUser) {
        Map<String, Object> data = new HashMap<String, Object>();
        data.put("request_id", row.get("request_id"));
        data.put("status_cd", row.get("status_cd"));
        data.put("expires_at", toEpochMillis(row.get("expires_at")));
        if (includeUser) {
            data.put("approved_login_id", row.get("approved_login_id"));
            data.put("approved_user_nm", row.get("approved_user_nm"));
        }
        return data;
    }

    private boolean isExpired(Map<String, Object> row) {
        Long expiresAt = toEpochMillis(row == null ? null : row.get("expires_at"));
        return expiresAt != null && expiresAt <= System.currentTimeMillis();
    }

    private String qrSvg(String value) {
        try {
            Map<EncodeHintType, Object> hints = new EnumMap<EncodeHintType, Object>(EncodeHintType.class);
            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
            hints.put(EncodeHintType.MARGIN, 1);
            BitMatrix matrix = new QRCodeWriter().encode(value, BarcodeFormat.QR_CODE, QR_SIZE, QR_SIZE, hints);
            StringBuilder svg = new StringBuilder();
            svg.append("<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 ")
                .append(QR_SIZE).append(' ').append(QR_SIZE).append("\" role=\"img\" aria-label=\"QR login\">")
                .append("<rect width=\"100%\" height=\"100%\" fill=\"#fff\"/>")
                .append("<path fill=\"#111827\" d=\"");
            for (int y = 0; y < QR_SIZE; y++) {
                for (int x = 0; x < QR_SIZE; x++) {
                    if (matrix.get(x, y)) {
                        svg.append('M').append(x).append(' ').append(y).append("h1v1h-1z");
                    }
                }
            }
            svg.append("\"/></svg>");
            return svg.toString();
        } catch (WriterException e) {
            throw new IllegalStateException("QR 코드를 생성하지 못했습니다.", e);
        }
    }

    private String randomToken() {
        byte[] bytes = new byte[TOKEN_BYTES];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String token) {
        try {
            byte[] tokenBytes = String.valueOf(token).getBytes(StandardCharsets.UTF_8);
            byte[] hashed;
            if (!tokenSecret.isEmpty()) {
                Mac mac = Mac.getInstance("HmacSHA256");
                mac.init(new SecretKeySpec(tokenSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
                hashed = mac.doFinal(tokenBytes);
            } else {
                MessageDigest digest = MessageDigest.getInstance("SHA-256");
                hashed = digest.digest(tokenBytes);
            }
            return java.util.HexFormat.of().formatHex(hashed);
        } catch (Exception e) {
            throw new IllegalStateException("failed to hash QR token", e);
        }
    }

    private String publicBaseUrl(HttpServletRequest request) {
        String requestBaseUrl = requestBaseUrl(request);
        if (configuredPublicBaseUrl.isEmpty() || isLocalBaseUrl(configuredPublicBaseUrl)) {
            return requestBaseUrl.isEmpty() ? configuredPublicBaseUrl : requestBaseUrl;
        }
        return configuredPublicBaseUrl;
    }

    private String requestBaseUrl(HttpServletRequest request) {
        if (request == null) return "";
        String scheme = request.getScheme();
        String host = request.getServerName();
        int port = request.getServerPort();
        return scheme + "://" + host + (("http".equalsIgnoreCase(scheme) && port == 80) || ("https".equalsIgnoreCase(scheme) && port == 443) ? "" : ":" + port);
    }

    private boolean isLocalBaseUrl(String value) {
        try {
            java.net.URI uri = java.net.URI.create(value);
            String host = uri.getHost();
            return "localhost".equalsIgnoreCase(host) || "127.0.0.1".equals(host) || "::1".equals(host);
        } catch (Exception ignored) {
            return false;
        }
    }

    private String normalizeBaseUrl(String value) {
        String text = value == null ? "" : value.trim();
        while (text.endsWith("/")) {
            text = text.substring(0, text.length() - 1);
        }
        return text;
    }

    private String requiredText(String value, String name) {
        String text = value == null ? "" : value.trim();
        if (text.isEmpty()) {
            throw new IllegalArgumentException(name + " is required");
        }
        return text;
    }

    private String stringValue(Object value) {
        if (value == null) return null;
        String text = String.valueOf(value).trim();
        return text.isEmpty() ? null : text;
    }

    private Long toEpochMillis(Object value) {
        if (value == null) return null;
        if (value instanceof java.sql.Timestamp) return ((java.sql.Timestamp) value).getTime();
        if (value instanceof Date) return ((Date) value).getTime();
        if (value instanceof Instant) return ((Instant) value).toEpochMilli();
        return null;
    }

    private String header(HttpServletRequest request, String name) {
        return request == null ? null : request.getHeader(name);
    }

    private String extractClientIp(HttpServletRequest request) {
        if (request == null) return null;
        if (isTrustedForwardedSource(request)) {
            String forwarded = header(request, "X-Forwarded-For");
            if (forwarded != null && !forwarded.trim().isEmpty()) {
                return trimToNull(forwarded.split(",")[0], 45);
            }
            String realIp = trimToNull(header(request, "X-Real-IP"), 45);
            if (realIp != null) {
                return realIp;
            }
        }
        return trimToNull(request.getRemoteAddr(), 45);
    }

    private boolean isTrustedForwardedSource(HttpServletRequest request) {
        String configured = trimToNull(System.getProperty("app.trust-forwarded-headers"), 16);
        if (configured == null) {
            configured = trimToNull(System.getenv("TRUST_FORWARDED_HEADERS"), 16);
        }
        if ("true".equalsIgnoreCase(configured)) {
            return true;
        }
        try {
            InetAddress address = InetAddress.getByName(request.getRemoteAddr());
            return address.isLoopbackAddress();
        } catch (Exception ignored) {
            return false;
        }
    }

    private String trimToNull(String value, int maxLength) {
        if (value == null) return null;
        String text = value.trim();
        if (text.isEmpty()) return null;
        return text.length() > maxLength ? text.substring(0, maxLength) : text;
    }
}
