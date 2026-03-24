package com.ers.ersbackend.repository;

import com.ers.ersbackend.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, String> {
}
