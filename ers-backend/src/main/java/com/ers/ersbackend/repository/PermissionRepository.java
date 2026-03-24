package com.ers.ersbackend.repository;

import com.ers.ersbackend.model.Permission;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PermissionRepository extends JpaRepository<Permission, String> {
}
