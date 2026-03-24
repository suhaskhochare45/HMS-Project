package com.ers.ersbackend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "permissions")
public class Permission {

    @Id
    @Column(length = 50)
    private String name;

    public Permission() {}

    public Permission(String name) { this.name = name; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
