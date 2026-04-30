package com.liraz.heatlink.backend.repository;

import com.liraz.heatlink.backend.model.CheckResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CheckResultRepository extends JpaRepository<CheckResult, Long> {

    List<CheckResult> findTop20ByOrderByCheckedAtDesc();

    List<CheckResult> findByUrlOrderByCheckedAtDesc(String url);
}
