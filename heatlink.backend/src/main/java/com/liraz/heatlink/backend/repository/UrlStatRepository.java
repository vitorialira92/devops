package com.liraz.heatlink.backend.repository;

import com.liraz.heatlink.backend.model.UrlStat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UrlStatRepository extends JpaRepository<UrlStat, Long> {

    Optional<UrlStat> findByUrl(String url);

    List<UrlStat> findTop10ByOrderByQueryCountDesc();
}
