package org.example.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
    name = "addresses",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_addresses_user_id",
            columnNames = "user_id"
        )
    }
)
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // ============================================================
    // USER MAPPING
    // ============================================================

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "user_id",
        nullable = false,
        unique = true,
        foreignKey = @ForeignKey(
            name = "fk_addresses_user"
        )
    )
    private User user;

    // ============================================================
    // ADDRESS
    // ============================================================

    @Column(
        name = "address",
        nullable = false,
        length = 500
    )
    private String address;

    // ============================================================
    // COORDINATES
    // ============================================================

    @Column(
        name = "latitude",
        nullable = false
    )
    private Double latitude;

    @Column(
        name = "longitude",
        nullable = false
    )
    private Double longitude;

    // ============================================================
    // CONSTRUCTOR
    // ============================================================

    public Address() {
    }

    // ============================================================
    // GETTERS / SETTERS
    // ============================================================

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }
}