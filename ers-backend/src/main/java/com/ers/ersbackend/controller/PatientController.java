package com.ers.ersbackend.controller;

import com.ers.ersbackend.model.Patient;
import com.ers.ersbackend.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/patient")
public class PatientController {

    @Autowired
    private PatientService patientService;

    // ✅ CREATE
    @PreAuthorize("hasAuthority('MANAGE_PATIENTS')")
    @PostMapping("/add")
    public Patient addPatient(@RequestBody Patient patient) {
        return patientService.addPatient(patient);
    }

    // ✅ READ ALL
    @PreAuthorize("hasAuthority('VIEW_PATIENTS')")
    @GetMapping("/all")
    public List<Patient> getAllPatients() {
        return patientService.getAllPatients();
    }

    // ✅ READ BY ID
    @PreAuthorize("hasAuthority('VIEW_PATIENTS')")
    @GetMapping("/{id}")
    public Patient getPatientById(@PathVariable("id") Long id) {
        return patientService.getPatientById(id);
    }

    // ✅ UPDATE
    @PreAuthorize("hasAuthority('MANAGE_PATIENTS')")
    @PutMapping("/update/{id}")
    public Patient updatePatient(@PathVariable("id") Long id,
                                 @RequestBody Patient patient) {
        return patientService.updatePatient(id, patient);
    }

    // ✅ DELETE
    @PreAuthorize("hasAuthority('MANAGE_PATIENTS')")
    @DeleteMapping("/delete/{id}")
    public String deletePatient(@PathVariable("id") Long id) {
        patientService.deletePatient(id);
        return "Patient deleted successfully";
    }
}