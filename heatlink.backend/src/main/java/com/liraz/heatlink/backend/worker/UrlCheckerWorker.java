package com.liraz.heatlink.backend.worker;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Slf4j
@Component
@Profile("worker")
@RequiredArgsConstructor
public class UrlCheckerWorker implements CommandLineRunner {

    private static final String QUEUE_KEY = "url-queue";

    private final com.liraz.heatlink.backend.service.UrlCheckerService urlCheckerService;
    private final org.springframework.data.redis.core.RedisTemplate<String, String> redisTemplate;

    @Override
    public void run(String... args) {
        log.info("Worker iniciado. Aguardando URLs na fila '{}'...", QUEUE_KEY);

        while (!Thread.currentThread().isInterrupted()) {
            try {
                String url = redisTemplate.opsForList()
                        .rightPop(QUEUE_KEY, Duration.ofSeconds(5));

                if (url != null) {
                    log.info("URL recebida da fila: {}", url);
                    urlCheckerService.check(url);
                }

            } catch (Exception e) {
                log.error("Erro no worker: {}. Aguardando 2s antes de tentar novamente.", e.getMessage());
                try {
                    Thread.sleep(2000);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    log.warn("Worker interrompido.");
                    break;
                }
            }
        }
    }
}
