package com.ers.ersbackend.controller;

import com.ers.ersbackend.model.User;
import com.ers.ersbackend.model.Role;
import com.ers.ersbackend.model.Permission;
import com.ers.ersbackend.repository.UserRepository;
import com.ers.ersbackend.repository.RoleRepository;
import com.ers.ersbackend.repository.PermissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.HashSet;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PermissionRepository permissionRepository;

    @Autowired
    private com.ers.ersbackend.repository.PatientRepository patientRepository;

    //  Dashboard logic
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/dashboard")
    public String adminDashboard() {
        return "System running smoothly. All services operational.";
    }

    //  MANAGE USERS
    @PreAuthorize("hasAuthority('MANAGE_USERS')")
    @GetMapping("/all-users")
    public List<User> allUsers() {
        return userRepository.findAll();
    }

    @PreAuthorize("hasAuthority('MANAGE_USERS')")
    @PutMapping("/update-role/{id}")
    public User updateUserRole(@PathVariable("id") Long id, @RequestParam("newRole") String newRole) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        Role role = roleRepository.findById(newRole.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Invalid role object."));
        user.setRole(role);
        return userRepository.save(user);
    }

    @PreAuthorize("hasAuthority('MANAGE_USERS')")
    @PutMapping("/update-user/{id}")
    public User updateUser(@PathVariable("id") Long id, @RequestBody User request) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        return userRepository.save(user);
    }

    @PreAuthorize("hasAuthority('MANAGE_USERS')")
    @DeleteMapping("/delete-user/{id}")
    public String deleteUser(@PathVariable("id") Long id) {
        userRepository.deleteById(id);
        return "User deleted successfully";
    }

    //  ADMINISTRATIVE PATIENT READS
    @PreAuthorize("hasAuthority('VIEW_PATIENTS')")
    @GetMapping("/patients")
    public List<com.ers.ersbackend.model.Patient> allPatients() {
        return patientRepository.findAll();
    }

    //  MANAGE ROLES AND PERMISSIONS
    @PreAuthorize("hasAuthority('MANAGE_USERS')")
    @GetMapping("/roles")
    public List<Role> allRoles() {
        return roleRepository.findAll();
    }

    @PreAuthorize("hasAuthority('MANAGE_USERS')")
    @GetMapping("/permissions")
    public List<Permission> allPermissions() {
        return permissionRepository.findAll();
    }

    @PreAuthorize("hasAuthority('MANAGE_USERS')")
    @PutMapping("/roles/{name}/permissions")
    public Role updateRolePermissions(@PathVariable("name") String name, @RequestBody List<String> permissionNames) {
        Role role = roleRepository.findById(name.toUpperCase()).orElseThrow(() -> new RuntimeException("Role not found"));
        Set<Permission> perms = new HashSet<>();
        for (String pName : permissionNames) {
            permissionRepository.findById(pName).ifPresent(perms::add);
        }
        role.setPermissions(perms);
        return roleRepository.save(role);
    }
}