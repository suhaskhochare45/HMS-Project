package com.ers.ersbackend.controller;

import com.ers.ersbackend.model.Patient;
import com.ers.ersbackend.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.ers.ersbackend.model.User;
import com.ers.ersbackend.model.Appointment;

@RestController
@RequestMapping("/doctor")
public class DoctorController {

    @Autowired
    private PatientService patientService;

    // ✅ Only DOCTOR can access
    @PreAuthorize("hasRole('DOCTOR')")
    @GetMapping("/dashboard")
    public String doctorDashboard() {
        return "Welcome DOCTOR";
    }

    @Autowired
    private com.ers.ersbackend.repository.UserRepository userRepository;

    @Autowired
    private com.ers.ersbackend.repository.AppointmentRepository appointmentRepository;

    // ✅ View My patients
    @PreAuthorize("hasAuthority('VIEW_PATIENTS')")
    @GetMapping("/patients")
    public List<Patient> getPatients() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User loggedInDoctor = userRepository.findByEmail(auth.getName()).orElseThrow(() -> new RuntimeException("Doctor account missing"));
        
        List<Appointment> myApts = appointmentRepository.findAll().stream()
            .filter(a -> a.getDoctorName().equals(loggedInDoctor.getName()))
            .collect(java.util.stream.Collectors.toList());
            
        List<String> myPatientNames = myApts.stream().map(Appointment::getPatientName).distinct().collect(java.util.stream.Collectors.toList());
        
        return patientService.getAllPatients().stream()
            .filter(p -> myPatientNames.contains(p.getName()))
            .collect(java.util.stream.Collectors.toList());
    }

    // ✅ View My appointments
    @PreAuthorize("hasAuthority('VIEW_APPOINTMENTS')")
    @GetMapping("/appointments")
    public List<Appointment> getMyAppointments() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User loggedInDoctor = userRepository.findByEmail(auth.getName()).orElseThrow(() -> new RuntimeException("Doctor account missing"));
        
        return appointmentRepository.findAll().stream()
            .filter(a -> a.getDoctorName().equals(loggedInDoctor.getName()))
            .collect(java.util.stream.Collectors.toList());
    }

    @Autowired
    private com.ers.ersbackend.repository.PatientRepository patientRepository;

    // ✅ Add prescription
    @PreAuthorize("hasAuthority('MANAGE_PRESCRIPTIONS')")
    @PostMapping("/add-prescription")
    public String addPrescription(@RequestParam("patientName") String patientName,
                                  @RequestParam("medicine") String medicine) {
        
        java.util.Optional<Patient> pOpt = patientRepository.findByName(patientName);
        if (pOpt.isPresent()) {
            Patient p = pOpt.get();
            p.setPrescription(medicine);
            patientRepository.save(p);
            return "Prescription added for " + patientName + " with medicine " + medicine;
        } else {
            throw new RuntimeException("Patient " + patientName + " not found.");
        }
    }
}