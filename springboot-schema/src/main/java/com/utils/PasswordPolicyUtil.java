package com.utils;

import org.apache.commons.lang3.StringUtils;

public class PasswordPolicyUtil {

    public static String validatePassword(String password) {
        String value = password == null ? "" : password;
        if (StringUtils.isBlank(value)) {
            return "\u5bc6\u7801\u4e0d\u80fd\u4e3a\u7a7a";
        }
        if (value.length() < 6 || value.length() > 12) {
            return "\u5bc6\u7801\u957f\u5ea6\u9700\u8981\u5728 6 \u5230 12 \u4f4d";
        }
        if (!value.matches(".*[A-Z].*")) {
            return "\u5bc6\u7801\u9700\u8981\u81f3\u5c11\u4e00\u4f4d\u5927\u5199\u5b57\u6bcd";
        }
        if (!value.matches(".*[a-z].*")) {
            return "\u5bc6\u7801\u9700\u8981\u81f3\u5c11\u4e00\u4f4d\u5c0f\u5199\u5b57\u6bcd";
        }
        if (!value.matches(".*[^A-Za-z0-9].*")) {
            return "\u5bc6\u7801\u9700\u8981\u81f3\u5c11\u4e00\u4f4d\u7279\u6b8a\u7b26\u53f7";
        }
        return null;
    }
}
