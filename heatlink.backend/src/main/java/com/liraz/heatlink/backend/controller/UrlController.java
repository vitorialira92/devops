package com.liraz.heatlink.backend.controller;

import com.liraz.heatlink.backend.model.CheckResult;
import com.liraz.heatlink.backend.model.UrlStat;
import com.liraz.heatlink.backend.service.UrlCheckerService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api")
@Profile("api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UrlController {

    private static final String QUEUE_KEY    = "url-queue";
    private static final String CACHE_PREFIX = "cache:url:";


    @Value("${heatlink.cache.ttl-seconds:30}")
    private long cacheTtlSeconds;

    private final RedisTemplate<String, String> redisTemplate;
    private final UrlCheckerService urlCheckerService;
    private final ObjectMapper objectMapper;

    @PostMapping("/check")
    public ResponseEntity<?> submitUrl(@RequestParam String url) {

        if (url == null || url.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "URL não pode ser nula ou vazia"));
        }

        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = "https://" + url;
        }

        String cacheKey = CACHE_PREFIX + url;

        try {
            String cached = redisTemplate.opsForValue().get(cacheKey);
            if (cached != null) {
                CheckResult result = objectMapper.readValue(cached, CheckResult.class);
                log.info("Cache hit para URL: {}", url);
                return ResponseEntity.ok(Map.of(
                        "source",  "cache",
                        "result",  result
                ));
            }
        } catch (Exception e) {
            log.warn("Erro ao ler cache para {}: {}", url, e.getMessage());
        }

        log.info("Cache miss. Enfileirando URL: {}", url);
        redisTemplate.opsForList().leftPush(QUEUE_KEY, url);

        return ResponseEntity.accepted().body(Map.of(
                "source",  "queued",
                "message", "URL enfileirada para processamento. Consulte novamente em instantes."
        ));
    }

    @GetMapping("/results/url")
    public ResponseEntity<List<CheckResult>> getResultsByUrl(@RequestParam String url) {
        return ResponseEntity.ok(urlCheckerService.getByUrl(url));
    }

    @GetMapping("/ranking")
    public ResponseEntity<List<UrlStat>> getRanking() {
        return ResponseEntity.ok(urlCheckerService.getRanking());
    }
}
