package com.ers.ersbackend.controller;

import com.ers.ersbackend.model.Patient;
import com.ers.ersbackend.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/receptionist")
public class ReceptionistController {

    @Autowired
    private PatientService patientService;

    @Autowired
    private com.ers.ersbackend.repository.UserRepository userRepository;

    // ✅ FETCH DOCTORS FOR APPOINTMENT BOOKING DROPDOWN
    @PreAuthorize("hasAuthority('MANAGE_APPOINTMENTS')")
    @GetMapping("/doctors")
    public List<com.ers.ersbackend.model.User> getAvailableDoctors() {
        return userRepository.findAll().stream()
               .filter(u -> u.getRole() != null && u.getRole().getName().equalsIgnoreCase("DOCTOR"))
               .collect(java.util.stream.Collectors.toList());
    }

    // ✅ CREATE
    @PreAuthorize("hasAuthority('MANAGE_PATIENTS')")
    @PostMapping("/add-patient")
    public Patient addPatient(@RequestBody Patient patient) {
        return patientService.addPatient(patient);
    }

    // ✅ READ ALL
    @PreAuthorize("hasAuthority('VIEW_PATIENTS')")
    @GetMapping("/patients")
    public List<Patient> getAllPatients() {
        return patientService.getAllPatients();
    }

    // ✅ READ ONE
    @PreAuthorize("hasAuthority('VIEW_PATIENTS')")
    @GetMapping("/patient/{id}")
    public Patient getPatientById(@PathVariable("id") Long id) {
        return patientService.getPatientById(id);
    }

    // ✅ UPDATE
    @PreAuthorize("hasAuthority('MANAGE_PATIENTS')")
    @PutMapping("/update-patient/{id}")
    public Patient updatePatient(@PathVariable("id") Long id,
                                 @RequestBody Patient patient) {
        return patientService.updatePatient(id, patient);
    }

    // ✅ DELETE
    @PreAuthorize("hasAuthority('MANAGE_PATIENTS')")
    @DeleteMapping("/delete-patient/{id}")
    public String deletePatient(@PathVariable("id") Long id) {
        patientService.deletePatient(id);
        return "Patient deleted successfully";
    }
}