package com.realhogoo.jsadmin.api;

public enum ApiCode {
    OK("success"),
    VALIDATION_ERROR("\uc785\ub825\uac12\uc744 \ud655\uc778\ud574\uc8fc\uc138\uc694."),
    AUTH_REQUIRED("\ub85c\uadf8\uc778\uc774 \ud544\uc694\ud569\ub2c8\ub2e4."),
    FORBIDDEN("\uad8c\ud55c\uc774 \uc5c6\uc2b5\ub2c8\ub2e4. \uad00\ub9ac\uc790\uc5d0\uac8c \uad8c\ud55c \uc124\uc815\uc744 \uc694\uccad\ud558\uc138\uc694."),
    NOT_FOUND("\uc694\uccad\ud55c \ub300\uc0c1\uc744 \ucc3e\uc744 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4."),
    BIZ_ERROR("\uc694\uccad\uc744 \ucc98\ub9ac\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4."),
    SERVER_ERROR("\uc11c\ubc84 \uc624\ub958\uac00 \ubc1c\uc0dd\ud588\uc2b5\ub2c8\ub2e4. \uad00\ub9ac\uc790\uc5d0\uac8c \ubb38\uc758\ud558\uc138\uc694."),
    UNAUTHORIZED("\ub85c\uadf8\uc778\uc774 \ud544\uc694\ud569\ub2c8\ub2e4."),
    METHOD_NOT_ALLOWED("\ud5c8\uc6a9\ub418\uc9c0 \uc54a\uc740 \uc694\uccad \ubc29\uc2dd\uc785\ub2c8\ub2e4.");

    private final String defaultMessage;

    ApiCode(String defaultMessage) {
        this.defaultMessage = defaultMessage;
    }

    public String defaultMessage() {
        return defaultMessage;
    }
}
