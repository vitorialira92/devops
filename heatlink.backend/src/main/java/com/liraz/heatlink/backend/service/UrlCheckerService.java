package com.liraz.heatlink.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.liraz.heatlink.backend.model.CheckResult;
import com.liraz.heatlink.backend.model.UrlStat;
import com.liraz.heatlink.backend.model.UrlStatus;
import com.liraz.heatlink.backend.repository.CheckResultRepository;
import com.liraz.heatlink.backend.repository.UrlStatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.net.UnknownHostException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UrlCheckerService {

    private static final long ONLINE_THRESHOLD_MS = 1500;
    private static final long SLOW_THRESHOLD_MS = 4000;
    private static final String CACHE_PREFIX = "cache:url:";

    @Value("${heatlink.cache.ttl-seconds:30}")
    private long cacheTtlSeconds;

    private final RestTemplate          restTemplate;
    private final CheckResultRepository checkResultRepository;
    private final UrlStatRepository     urlStatRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper          objectMapper;

    @Transactional
    public void check(String url) {
        log.info("Checando URL: {}", url);

        CheckResult result;

        try {
            long start    = System.currentTimeMillis();
            ResponseEntity<Void> response = restTemplate.getForEntity(url, Void.class);
            long elapsed  = System.currentTimeMillis() - start;

            result = CheckResult.builder()
                    .url(url)
                    .status(classifyByTime(elapsed))
                    .responseTimeMs(elapsed)
                    .httpStatusCode(response.getStatusCode().value())
                    .checkedAt(LocalDateTime.now())
                    .build();

        } catch (HttpStatusCodeException e) {
            result = CheckResult.builder()
                    .url(url)
                    .status(UrlStatus.OFFLINE)
                    .httpStatusCode(e.getStatusCode().value())
                    .errorMessage(truncate(e.getMessage()))
                    .checkedAt(LocalDateTime.now())
                    .build();

        } catch (ResourceAccessException e) {
            UrlStatus status = isNetworkError(e) ? UrlStatus.UNREACHABLE : UrlStatus.OFFLINE;
            result = CheckResult.builder()
                    .url(url)
                    .status(status)
                    .errorMessage(truncate(e.getMessage()))
                    .checkedAt(LocalDateTime.now())
                    .build();

        } catch (Exception e) {
            log.error("Erro inesperado ao checar {}: {}", url, e.getMessage());
            result = CheckResult.builder()
                    .url(url)
                    .status(UrlStatus.UNKNOWN)
                    .errorMessage(truncate(e.getMessage()))
                    .checkedAt(LocalDateTime.now())
                    .build();
        }

        checkResultRepository.save(result);

        saveToCache(url, result);

        incrementStat(url);

        log.info("Resultado para {}: {} ({}ms)", url, result.getStatus(), result.getResponseTimeMs());
    }
    public List<CheckResult> getRecent() {
        return checkResultRepository.findTop20ByOrderByCheckedAtDesc();
    }

    public List<CheckResult> getByUrl(String url) {
        return checkResultRepository.findByUrlOrderByCheckedAtDesc(url);
    }

    public List<UrlStat> getRanking() {
        return urlStatRepository.findTop10ByOrderByQueryCountDesc();
    }

    private void saveToCache(String url, CheckResult result) {
        try {
            String json = objectMapper.writeValueAsString(result);
            redisTemplate.opsForValue().set(
                    CACHE_PREFIX + url,
                    json,
                    Duration.ofSeconds(cacheTtlSeconds)
            );
            log.debug("Cache atualizado para {} (TTL={}s)", url, cacheTtlSeconds);
        } catch (Exception e) {
            log.warn("Falha ao salvar cache para {}: {}", url, e.getMessage());
        }
    }

    private void incrementStat(String url) {
        try {
            UrlStat stat = urlStatRepository.findByUrl(url)
                    .orElseGet(() -> UrlStat.builder()
                            .url(url)
                            .queryCount(0L)
                            .build());
            stat.setQueryCount(stat.getQueryCount() + 1);
            urlStatRepository.save(stat);
        } catch (Exception e) {
            log.warn("Falha ao incrementar stat para {}: {}", url, e.getMessage());
        }
    }

    private static final int MAX_ERROR_LENGTH = 2000;

    private String truncate(String msg) {
        if (msg == null) return null;
        return msg.length() <= MAX_ERROR_LENGTH ? msg : msg.substring(0, MAX_ERROR_LENGTH);
    }

    private UrlStatus classifyByTime(long ms) {
        if (ms < ONLINE_THRESHOLD_MS) return UrlStatus.ONLINE;
        if (ms < SLOW_THRESHOLD_MS)   return UrlStatus.SLOW;
        return UrlStatus.DEGRADED;
    }

    private boolean isNetworkError(ResourceAccessException e) {
        Throwable cause = e.getCause();
        while (cause != null) {
            if (cause instanceof UnknownHostException) return true;
            cause = cause.getCause();
        }
        return false;
    }
}