package com.mealmap.service;

import com.mealmap.dto.UserDto;
import com.mealmap.dto.account.*;
import com.mealmap.exception.BadRequestException;
import com.mealmap.exception.ResourceNotFoundException;
import com.mealmap.exception.UnauthorizedException;
import com.mealmap.mapper.UserMapper;
import com.mealmap.model.entity.User;
import com.mealmap.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

/**
 * Account Service
 * 
 * Handles user account management operations:
 * - Profile updates
 * - Password changes
 * - Password resets (forgot password flow)
 * - Account deletion
 * - Preferences management
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AccountService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final UserMapper userMapper;

    /**
     * Get the currently authenticated user's UUID
     */
    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("User is not authenticated");
        }
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getId();
    }

    /**
     * Get current user's profile
     */
    @Transactional(readOnly = true)
    public UserDto getCurrentUser() {
        UUID userId = getCurrentUserId();
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return userMapper.toDto(user);
    }

    /**
     * Update user profile (display name and email)
     */
    @Transactional
    public UserDto updateProfile(ProfileUpdateRequest request) {
        UUID userId = getCurrentUserId();
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check if new email is already taken by another user
        if (!user.getEmail().equals(request.getEmail())) {
            userRepository.findByEmail(request.getEmail()).ifPresent(existingUser -> {
                if (!existingUser.getId().equals(userId)) {
                    throw new BadRequestException("Email is already in use");
                }
            });
            user.setEmailVerified(false); // Require verification for new email
        }

        user.setDisplayName(request.getDisplayName());
        user.setEmail(request.getEmail());
        
        User updated = userRepository.save(user);
        log.info("Profile updated for user: {}", userId);
        
        return userMapper.toDto(updated);
    }

    /**
     * Change user password
     */
    @Transactional
    public void changePassword(PasswordChangeRequest request) {
        UUID userId = getCurrentUserId();
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }

        // Set new password
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        log.info("Password changed for user: {}", userId);
    }

    /**
     * Initiate forgot password flow
     * Generates a reset token and sends email
     */
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElse(null);

        // Always return success to prevent email enumeration
        // Even if user doesn't exist, pretend we sent an email
        if (user == null) {
            log.warn("Password reset requested for non-existent email: {}", request.getEmail());
            return;
        }

        // Generate reset token (UUID)
        String token = UUID.randomUUID().toString();
        
        // Set token and expiry (1 hour from now)
        user.setPasswordResetToken(token);
        user.setPasswordResetExpiry(Instant.now().plus(1, ChronoUnit.HOURS));
        userRepository.save(user);

        // Send email with reset link
        emailService.sendPasswordResetEmail(user.getEmail(), token);
        
        log.info("Password reset initiated for user: {}", user.getId());
    }

    /**
     * Reset password using token
     */
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByPasswordResetToken(request.getToken())
            .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));

        // Check if token has expired
        if (user.getPasswordResetExpiry() == null || 
            Instant.now().isAfter(user.getPasswordResetExpiry())) {
            throw new BadRequestException("Reset token has expired");
        }

        // Update password
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        
        // Clear reset token
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiry(null);
        
        userRepository.save(user);
        
        log.info("Password reset completed for user: {}", user.getId());
    }

    /**
     * Update user preferences
     */
    @Transactional
    public void updatePreferences(PreferencesUpdateRequest request) {
        UUID userId = getCurrentUserId();
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setThemePreference(request.getThemePreference());
        userRepository.save(user);
        
        log.info("Preferences updated for user: {}", userId);
    }

    /**
     * Delete user account and all associated data
     */
    @Transactional
    public void deleteAccount() {
        UUID userId = getCurrentUserId();
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String email = user.getEmail();
        String displayName = user.getDisplayName();

        // Delete user (cascade will handle related data)
        userRepository.delete(user);
        
        // Send confirmation email
        emailService.sendAccountDeletionEmail(email, displayName);
        
        log.info("Account deleted for user: {}", userId);
    }

    /**
     * Update last login timestamp
     */
    @Transactional
    public void updateLastLogin(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        user.setLastLoginAt(Instant.now());
        userRepository.save(user);
    }

    /**
     * Record terms acceptance
     */
    @Transactional
    public void recordTermsAcceptance(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        if (user.getTermsAcceptedAt() == null) {
            user.setTermsAcceptedAt(Instant.now());
            userRepository.save(user);
            log.info("Terms acceptance recorded for user: {}", userId);
        }
    }
}
