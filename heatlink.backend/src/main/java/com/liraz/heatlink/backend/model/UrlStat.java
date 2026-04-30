package com.liraz.heatlink.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "url_stats")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UrlStat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String url;

    @Column(name = "query_count", nullable = false)
    private Long queryCount = 0L;
}
