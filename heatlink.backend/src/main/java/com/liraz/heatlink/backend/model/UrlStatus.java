package com.liraz.heatlink.backend.model;

public enum UrlStatus {
    ONLINE,       // 2xx/3xx e tempo < 1500ms
    SLOW,         // 2xx/3xx e tempo entre 1500ms e 4000ms
    DEGRADED,     // 2xx/3xx e tempo > 4000ms
    OFFLINE,      // timeout, erro de conexão ou HTTP 5xx
    UNREACHABLE,  // DNS falhou, SSL inválido, erro de rede
    UNKNOWN       // exceção inesperada
}
