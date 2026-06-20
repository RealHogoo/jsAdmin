package com.realhogoo.jsadmin.auth.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import javax.crypto.Cipher;
import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.SecureRandom;
import java.security.spec.MGF1ParameterSpec;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import javax.crypto.spec.OAEPParameterSpec;
import javax.crypto.spec.PSource;

@Service
public class LoginCryptoService {
    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<Map<String, Object>>() { };
    private static final OAEPParameterSpec OAEP_SHA256 = new OAEPParameterSpec(
        "SHA-256",
        "MGF1",
        MGF1ParameterSpec.SHA256,
        PSource.PSpecified.DEFAULT
    );

    private final ObjectMapper objectMapper = new ObjectMapper();
    private KeyPair keyPair;
    private String keyId;

    @PostConstruct
    public void init() {
        rotateKey();
    }

    public synchronized Map<String, Object> publicKey() {
        ensureKeyPair();
        Map<String, Object> data = new LinkedHashMap<String, Object>();
        data.put("key_id", keyId);
        data.put("alg", "RSA-OAEP-256");
        data.put("public_key", Base64.getEncoder().encodeToString(keyPair.getPublic().getEncoded()));
        return data;
    }

    public Map<String, Object> decryptPayload(String keyId, String encryptedPayload) {
        ensureKeyPair();
        if (keyId == null || !this.keyId.equals(keyId.trim())) {
            throw new IllegalArgumentException("login encryption key is invalid");
        }
        if (encryptedPayload == null || encryptedPayload.trim().isEmpty()) {
            throw new IllegalArgumentException("login payload is required");
        }
        try {
            byte[] cipherBytes = Base64.getDecoder().decode(encryptedPayload.trim());
            Cipher cipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding");
            cipher.init(Cipher.DECRYPT_MODE, privateKey(), OAEP_SHA256);
            byte[] plainBytes = cipher.doFinal(cipherBytes);
            return objectMapper.readValue(new String(plainBytes, StandardCharsets.UTF_8), MAP_TYPE);
        } catch (IllegalArgumentException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new IllegalArgumentException("login payload decrypt failed");
        }
    }

    private synchronized void ensureKeyPair() {
        if (keyPair == null) {
            rotateKey();
        }
    }

    private void rotateKey() {
        try {
            KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
            generator.initialize(2048, new SecureRandom());
            keyPair = generator.generateKeyPair();
            keyId = UUID.randomUUID().toString().replace("-", "");
        } catch (Exception exception) {
            throw new IllegalStateException("login crypto key generation failed", exception);
        }
    }

    private PrivateKey privateKey() {
        return keyPair.getPrivate();
    }

    @SuppressWarnings("unused")
    private PublicKey publicKeyObject() {
        return keyPair.getPublic();
    }
}
