package com.mealmap.controller;

import com.mealmap.dto.UserDto;
import com.mealmap.dto.account.*;
import com.mealmap.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Account Controller
 * 
 * Handles account management endpoints:
 * - GET /api/account - Get current user profile
 * - PUT /api/account/profile - Update profile
 * - PUT /api/account/password - Change password
 * - PUT /api/account/preferences - Update preferences
 * - DELETE /api/account - Delete account
 * - POST /api/account/forgot-password - Initiate password reset
 * - POST /api/account/reset-password - Complete password reset
 */
@RestController
@RequestMapping("/api/account")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    /**
     * Get current user profile
     * 
     * @return UserDto with profile information
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDto> getCurrentUser() {
        return ResponseEntity.ok(accountService.getCurrentUser());
    }

    /**
     * Update user profile
     * 
     * @param request ProfileUpdateRequest with displayName and email
     * @return Updated UserDto
     */
    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDto> updateProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        return ResponseEntity.ok(accountService.updateProfile(request));
    }

    /**
     * Change password
     * 
     * @param request PasswordChangeRequest with currentPassword and newPassword
     * @return 204 No Content on success
     */
    @PutMapping("/password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody PasswordChangeRequest request) {
        accountService.changePassword(request);
        return ResponseEntity.noContent().build();
    }

    /**
     * Update user preferences
     * 
     * @param request PreferencesUpdateRequest with themePreference
     * @return 204 No Content on success
     */
    @PutMapping("/preferences")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> updatePreferences(@Valid @RequestBody PreferencesUpdateRequest request) {
        accountService.updatePreferences(request);
        return ResponseEntity.noContent().build();
    }

    /**
     * Delete user account
     * 
     * @return 204 No Content on success
     */
    @DeleteMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteAccount() {
        accountService.deleteAccount();
        return ResponseEntity.noContent().build();
    }

    /**
     * Initiate forgot password flow
     * Sends password reset email if user exists
     * 
     * @param request ForgotPasswordRequest with email
     * @return 200 OK (always returns success to prevent email enumeration)
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        accountService.forgotPassword(request);
        return ResponseEntity.ok().build();
    }

    /**
     * Reset password using token
     * 
     * @param request ResetPasswordRequest with token and newPassword
     * @return 204 No Content on success
     */
    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        accountService.resetPassword(request);
        return ResponseEntity.noContent().build();
    }
}
