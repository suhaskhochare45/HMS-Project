package com.ers.ersbackend.service;

import com.ers.ersbackend.model.Appointment;
import com.ers.ersbackend.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    // ✅ CREATE
    public Appointment bookAppointment(Appointment appointment) {
        return appointmentRepository.save(appointment);
    }

    // ✅ READ ALL
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    // ✅ READ BY DOCTOR
    public List<Appointment> getAppointmentsByDoctor(String doctorName) {
        return appointmentRepository.findByDoctorName(doctorName);
    }

    // ✅ READ ONE
    public Appointment getAppointmentById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));
    }

    // ✅ UPDATE
    public Appointment updateAppointment(Long id, Appointment updatedAppointment) {
        Appointment appointment = getAppointmentById(id);

        appointment.setPatientName(updatedAppointment.getPatientName());
        appointment.setDoctorName(updatedAppointment.getDoctorName());
        appointment.setAppointmentDate(updatedAppointment.getAppointmentDate());

        return appointmentRepository.save(appointment);
    }

    // ✅ DELETE
    public void deleteAppointment(Long id) {
        Appointment appointment = getAppointmentById(id);
        appointmentRepository.delete(appointment);
    }
}