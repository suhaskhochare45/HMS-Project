package com.ers.ersbackend.service;

import com.ers.ersbackend.model.Patient;
import com.ers.ersbackend.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    // ✅ CREATE
    public Patient addPatient(Patient patient) {
        return patientRepository.save(patient);
    }

    // ✅ READ ALL
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    // ✅ READ BY ID
    public Patient getPatientById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + id));
    }

    // ✅ UPDATE
    public Patient updatePatient(Long id, Patient updatedPatient) {
        Patient existingPatient = getPatientById(id);

        // 🔥 Only update fields if not null (better practice)
        if (updatedPatient.getName() != null) {
            existingPatient.setName(updatedPatient.getName());
        }

        if (updatedPatient.getAge() != 0) {
            existingPatient.setAge(updatedPatient.getAge());
        }

        if (updatedPatient.getDisease() != null) {
            existingPatient.setDisease(updatedPatient.getDisease());
        }

        return patientRepository.save(existingPatient);
    }

    // ✅ DELETE
    public void deletePatient(Long id) {
        Patient patient = getPatientById(id); // ensures existence
        patientRepository.delete(patient);
    }
}