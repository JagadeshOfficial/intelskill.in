package com.lms.auth.repository;

import com.lms.auth.entity.OtpStorage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpStorageRepository extends JpaRepository<OtpStorage, Integer> {
    Optional<OtpStorage> findByEmail(String email);
    void deleteByEmail(String email);
}
