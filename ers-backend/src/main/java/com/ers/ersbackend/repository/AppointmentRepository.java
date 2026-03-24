package com.ers.ersbackend.repository;

import com.ers.ersbackend.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // ✅ Get appointments by doctor
    List<Appointment> findByDoctorName(String doctorName);
}