package com.ronniebook.web.ebook.tts;

public class Speech {

    private Reader readerName;

    private SpeechLanguage language;

    public Speech() {}

    public Reader getReaderName() {
        return readerName;
    }

    public void setReaderName(Reader readerName) {
        this.readerName = readerName;
    }

    public SpeechLanguage getLanguage() {
        return language;
    }
}
