package com.realhogoo.jsadmin.web;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

@ControllerAdvice
public class ViewModelAdvice {

    private final String assetVersion;

    public ViewModelAdvice(@Value("${asset.version:20260329}") String assetVersion) {
        this.assetVersion = assetVersion == null || assetVersion.trim().isEmpty()
            ? "20260329"
            : assetVersion.trim();
    }

    @ModelAttribute("assetVersion")
    public String assetVersion() {
        return assetVersion;
    }
}
