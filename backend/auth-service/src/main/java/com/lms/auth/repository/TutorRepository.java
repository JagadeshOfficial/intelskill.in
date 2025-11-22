package com.lms.auth.repository;

import com.lms.auth.entity.Tutor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TutorRepository extends JpaRepository<Tutor, Integer> {
    Optional<Tutor> findByEmail(String email);
    Optional<Tutor> findByPhoneNumber(String phoneNumber);
}
