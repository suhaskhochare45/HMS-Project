package com.ers.ersbackend.controller;

import com.ers.ersbackend.model.Appointment;
import com.ers.ersbackend.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/appointment")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    //  BOOK
    @PreAuthorize("hasAuthority('MANAGE_APPOINTMENTS')")
    @PostMapping("/book")
    public Appointment book(@RequestBody Appointment appointment) {
        return appointmentService.bookAppointment(appointment);
    }

    //  VIEW DOCTOR
    @PreAuthorize("hasAuthority('VIEW_APPOINTMENTS')")
    @GetMapping("/doctor/{name}")
    public List<Appointment> getDoctorAppointments(@PathVariable("name") String name) {
        return appointmentService.getAppointmentsByDoctor(name);
    }

    //  VIEW ALL
    @PreAuthorize("hasAuthority('VIEW_APPOINTMENTS')")
    @GetMapping("/all")
    public List<Appointment> getAll() {
        return appointmentService.getAllAppointments();
    }

    //  VIEW ONE
    @PreAuthorize("hasAuthority('VIEW_APPOINTMENTS')")
    @GetMapping("/{id}")
    public Appointment getById(@PathVariable("id") Long id) {
        return appointmentService.getAppointmentById(id);
    }

    //  UPDATE
    @PreAuthorize("hasAuthority('MANAGE_APPOINTMENTS')")
    @PutMapping("/update/{id}")
    public Appointment update(@PathVariable("id") Long id,
                              @RequestBody Appointment appointment) {
        return appointmentService.updateAppointment(id, appointment);
    }

    // DELETE
    @PreAuthorize("hasAuthority('MANAGE_APPOINTMENTS')")
    @DeleteMapping("/delete/{id}")
    public String delete(@PathVariable("id") Long id) {
        appointmentService.deleteAppointment(id);
        return "Appointment deleted successfully";
    }
}