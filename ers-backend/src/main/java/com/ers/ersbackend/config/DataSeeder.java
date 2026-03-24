package com.ers.ersbackend.config;

import com.ers.ersbackend.model.Permission;
import com.ers.ersbackend.model.Role;
import com.ers.ersbackend.repository.PermissionRepository;
import com.ers.ersbackend.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PermissionRepository permissionRepository;

    @Override
    public void run(String... args) throws Exception {
        if (roleRepository.count() == 0) {
            // Create granular Permissions
            Permission manageUsers = permissionRepository.save(new Permission("MANAGE_USERS"));
            Permission viewUsers = permissionRepository.save(new Permission("VIEW_USERS"));
            Permission managePatients = permissionRepository.save(new Permission("MANAGE_PATIENTS"));
            Permission viewPatients = permissionRepository.save(new Permission("VIEW_PATIENTS"));
            Permission manageAppointments = permissionRepository.save(new Permission("MANAGE_APPOINTMENTS"));
            Permission viewAppointments = permissionRepository.save(new Permission("VIEW_APPOINTMENTS"));
            Permission managePrescriptions = permissionRepository.save(new Permission("MANAGE_PRESCRIPTIONS"));
            
            // Create Default Admin Role
            Role admin = new Role("ADMIN");
            admin.setPermissions(new HashSet<>(List.of(manageUsers, viewUsers, viewPatients, viewAppointments)));
            roleRepository.save(admin);

            // Create Default Doctor Role
            Role doctor = new Role("DOCTOR");
            doctor.setPermissions(new HashSet<>(List.of(viewPatients, viewAppointments, managePrescriptions)));
            roleRepository.save(doctor);

            // Create Default Receptionist Role
            Role receptionist = new Role("RECEPTIONIST");
            receptionist.setPermissions(new HashSet<>(List.of(managePatients, viewPatients, manageAppointments, viewAppointments)));
            roleRepository.save(receptionist);
        }
    }
}
