package com.ers.ersbackend.repository;

import com.ers.ersbackend.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByName(String name);
}