package com.realhogoo.jsadmin.auth.service;

import org.junit.jupiter.api.Test;

import javax.crypto.Cipher;
import javax.crypto.spec.OAEPParameterSpec;
import javax.crypto.spec.PSource;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.MGF1ParameterSpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

class LoginCryptoServiceTest {

    @Test
    void decryptsPayloadEncryptedWithPublishedPublicKey() throws Exception {
        LoginCryptoService service = new LoginCryptoService();
        service.init();

        Map<String, Object> key = service.publicKey();
        String encryptedPayload = encrypt(
            String.valueOf(key.get("public_key")),
            "{\"user_id\":\"ADMIN\",\"user_pw\":\"1111\"}"
        );

        Map<String, Object> decrypted = service.decryptPayload(
            String.valueOf(key.get("key_id")),
            encryptedPayload
        );

        assertEquals("ADMIN", decrypted.get("user_id"));
        assertEquals("1111", decrypted.get("user_pw"));
        assertFalse(key.containsKey("private_key"));
    }

    private String encrypt(String publicKeyBase64, String payload) throws Exception {
        byte[] publicKeyBytes = Base64.getDecoder().decode(publicKeyBase64);
        PublicKey publicKey = KeyFactory.getInstance("RSA")
            .generatePublic(new X509EncodedKeySpec(publicKeyBytes));
        Cipher cipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding");
        cipher.init(Cipher.ENCRYPT_MODE, publicKey, new OAEPParameterSpec(
            "SHA-256",
            "MGF1",
            MGF1ParameterSpec.SHA256,
            PSource.PSpecified.DEFAULT
        ));
        return Base64.getEncoder().encodeToString(cipher.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
    }
}
