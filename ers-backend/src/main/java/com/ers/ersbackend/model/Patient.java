package com.ers.ersbackend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "patients")
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private int age;
    private String disease;

    @Column(columnDefinition = "TEXT")
    private String prescription;

    // ✅ Constructors
    public Patient() {}

    public Patient(String name, int age, String disease) {
        this.name = name;
        this.age = age;
        this.disease = disease;
    }

    // ✅ Getters & Setters
    public Long getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }

    public String getDisease() { return disease; }
    public void setDisease(String disease) { this.disease = disease; }

    public String getPrescription() { return prescription; }
    public void setPrescription(String prescription) { this.prescription = prescription; }
}