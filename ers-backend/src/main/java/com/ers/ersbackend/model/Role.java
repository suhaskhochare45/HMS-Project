package com.ers.ersbackend.model;

import jakarta.persistence.*;
import java.util.Set;

@Entity
@Table(name = "roles")
public class Role {

    @Id
    @Column(length = 50)
    private String name;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "role_permissions",
        joinColumns = @JoinColumn(name = "role_name"),
        inverseJoinColumns = @JoinColumn(name = "permission_name")
    )
    private Set<Permission> permissions;

    public Role() {}

    public Role(String name) { this.name = name; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Set<Permission> getPermissions() { return permissions; }
    public void setPermissions(Set<Permission> permissions) { this.permissions = permissions; }
}