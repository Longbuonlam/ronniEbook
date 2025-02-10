package com.ronniebook.web.ebook.service;

import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class TTSService {

    private final RestTemplate restTemplate;
    private final Logger log = LoggerFactory.getLogger(TTSService.class);
    private final String VN_TTS_URL = "https://ntt123-viettts.hf.space/run/predict";

    public TTSService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public byte[] synthesizeSpeech(String text, String language) {
        log.debug("Request to get data from voicerss");
        String apiKey = "8ab5c7859af34cab8d68fca6da06e34a"; // Replace with your API key
        //        String language = "en-us";
        String url = "http://api.voicerss.org/?key=" + apiKey + "&hl=" + language + "&src=" + text + "&c=WAV";

        return restTemplate.getForObject(url, byte[].class);
    }

    private String getFileUrl(String text) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        String requestBody = "{\"data\": [\"" + text + "\"]}";
        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response = restTemplate.exchange(VN_TTS_URL, HttpMethod.POST, entity, Map.class);
        if (response.getBody() != null && response.getBody().containsKey("data")) {
            List<Map<String, Object>> dataList = (List<Map<String, Object>>) response.getBody().get("data");
            if (!dataList.isEmpty()) {
                return (String) dataList.get(0).get("name");
            }
        }
        return null;
    }

    public byte[] getVnAudio(String text) {
        log.debug("Request to get vietnamese speech data from hugging face");
        String fileUrl = getFileUrl(text);
        String url = "https://ntt123-viettts.hf.space/file=" + fileUrl;
        return restTemplate.getForObject(url, byte[].class);
    }
}
