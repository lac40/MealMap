package com.mealmap.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String displayName;

    private String avatarUrl;

    @Column(nullable = false)
    @Builder.Default
    private Boolean mfaEnabled = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean emailVerified = false;

    @ManyToOne
    @JoinColumn(name = "household_id")
    private Household household;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "terms_accepted_at")
    private Instant termsAcceptedAt;

    @Column(name = "password_reset_token")
    private String passwordResetToken;

    @Column(name = "password_reset_expiry")
    private Instant passwordResetExpiry;

    @Column(name = "theme_preference", length = 10)
    @Builder.Default
    private String themePreference = "system";

    @Column(name = "last_login_at")
    private Instant lastLoginAt;
}
