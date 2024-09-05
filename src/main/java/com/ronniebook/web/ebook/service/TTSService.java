package com.ronniebook.web.ebook.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class TTSService {

    private final RestTemplate restTemplate;

    public TTSService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public byte[] synthesizeSpeech(String text) {
        String apiKey = "8ab5c7859af34cab8d68fca6da06e34a"; // Replace with your API key
        String language = "en-us"; // Set the language you want
        String url = "http://api.voicerss.org/?key=" + apiKey + "&hl=" + language + "&src=" + text + "&c=WAV";

        return restTemplate.getForObject(url, byte[].class);
    }
}
