package com.ronniebook.web.ebook.tts;

/**
 * Speech Language
 * See more at https://www.voicerss.org/api/.
 */
public enum SpeechLanguage {
    VIETNAMESE("vi-vn"),
    ENGLISH("en-us"),
    FRENCH("fr-fr"),
    GERMAN("de-de"),
    SPANISH("es-es"),
    JAPANESE("ja-jp"),
    KOREAN("ko-kr");

    private final String language;

    SpeechLanguage(String language) {
        this.language = language;
    }

    public String getLanguage() {
        return language;
    }
}
