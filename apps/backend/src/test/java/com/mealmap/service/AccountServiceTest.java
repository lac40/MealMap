package com.mealmap.service;

import com.mealmap.dto.account.*;
import com.mealmap.exception.BadRequestException;
import com.mealmap.mapper.UserMapper;
import com.mealmap.model.entity.User;
import com.mealmap.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AccountService.
 * Note: Methods that use SecurityContextHolder (getCurrentUser, updateProfile, changePassword, 
 * updatePreferences, deleteAccount) are tested in AccountControllerTest as integration tests
 * with @WithMockUser annotation.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AccountService Unit Tests")
class AccountServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private AccountService accountService;

    private User testUser;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        testUser = User.builder()
                .id(userId)
                .email("test@example.com")
                .passwordHash("$2a$10$hashedpassword")
                .displayName("Test User")
                .mfaEnabled(false)
                .emailVerified(true)
                .themePreference("system")
                .createdAt(Instant.now())
                .build();
    }

    // ===========================
    // forgotPassword Tests
    // ===========================

    @Test
    @DisplayName("forgotPassword - Should generate token and send email for existing user")
    void forgotPassword_ExistingUser_Success() {
        // Arrange
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("test@example.com");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        doNothing().when(emailService).sendPasswordResetEmail(anyString(), anyString());

        // Act
        accountService.forgotPassword(request);

        // Assert
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertThat(savedUser.getPasswordResetToken()).isNotNull();
        assertThat(savedUser.getPasswordResetExpiry()).isNotNull();
        assertThat(savedUser.getPasswordResetExpiry())
                .isAfter(Instant.now())
                .isBefore(Instant.now().plus(2, ChronoUnit.HOURS));

        verify(emailService).sendPasswordResetEmail(eq("test@example.com"), anyString());
    }

    @Test
    @DisplayName("forgotPassword - Should not throw exception for non-existent email (email enumeration prevention)")
    void forgotPassword_NonExistentEmail_NoException() {
        // Arrange
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("nonexistent@example.com");

        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        // Act & Assert - should not throw exception
        assertThatCode(() -> accountService.forgotPassword(request))
                .doesNotThrowAnyException();

        verify(userRepository, never()).save(any());
        verify(emailService, never()).sendPasswordResetEmail(anyString(), anyString());
    }

    // ===========================
    // resetPassword Tests
    // ===========================

    @Test
    @DisplayName("resetPassword - Should reset password with valid token")
    void resetPassword_ValidToken_Success() {
        // Arrange
        String token = UUID.randomUUID().toString();
        testUser.setPasswordResetToken(token);
        testUser.setPasswordResetExpiry(Instant.now().plus(1, ChronoUnit.HOURS));

        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken(token);
        request.setNewPassword("newPassword123!");

        when(userRepository.findByPasswordResetToken(token)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.encode("newPassword123!")).thenReturn("$2a$10$newHashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        accountService.resetPassword(request);

        // Assert
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertThat(savedUser.getPasswordHash()).isEqualTo("$2a$10$newHashedPassword");
        assertThat(savedUser.getPasswordResetToken()).isNull();
        assertThat(savedUser.getPasswordResetExpiry()).isNull();
    }

    @Test
    @DisplayName("resetPassword - Should throw exception for invalid token")
    void resetPassword_InvalidToken_ThrowsException() {
        // Arrange
        String token = UUID.randomUUID().toString();
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken(token);
        request.setNewPassword("newPassword123!");

        when(userRepository.findByPasswordResetToken(token)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> accountService.resetPassword(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid or expired reset token");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("resetPassword - Should throw exception for expired token")
    void resetPassword_ExpiredToken_ThrowsException() {
        // Arrange
        String token = UUID.randomUUID().toString();
        testUser.setPasswordResetToken(token);
        testUser.setPasswordResetExpiry(Instant.now().minus(1, ChronoUnit.HOURS)); // Expired

        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken(token);
        request.setNewPassword("newPassword123!");

        when(userRepository.findByPasswordResetToken(token)).thenReturn(Optional.of(testUser));

        // Act & Assert
        assertThatThrownBy(() -> accountService.resetPassword(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Reset token has expired");

        verify(userRepository, never()).save(any());
    }

    // ===========================
    // updateLastLogin Tests
    // ===========================

    @Test
    @DisplayName("updateLastLogin - Should update last login timestamp")
    void updateLastLogin_Success() {
        // Arrange
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        Instant beforeCall = Instant.now();

        // Act
        accountService.updateLastLogin(userId);

        Instant afterCall = Instant.now();

        // Assert
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertThat(savedUser.getLastLoginAt())
                .isNotNull()
                .isAfterOrEqualTo(beforeCall)
                .isBeforeOrEqualTo(afterCall);
    }

    // ===========================
    // recordTermsAcceptance Tests
    // ===========================

    @Test
    @DisplayName("recordTermsAcceptance - Should record timestamp when null")
    void recordTermsAcceptance_Success() {
        // Arrange
        testUser.setTermsAcceptedAt(null);
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        Instant beforeCall = Instant.now();

        // Act
        accountService.recordTermsAcceptance(userId);

        Instant afterCall = Instant.now();

        // Assert
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertThat(savedUser.getTermsAcceptedAt())
                .isNotNull()
                .isAfterOrEqualTo(beforeCall)
                .isBeforeOrEqualTo(afterCall);
    }

    @Test
    @DisplayName("recordTermsAcceptance - Should not update if already accepted")
    void recordTermsAcceptance_AlreadyAccepted_NoUpdate() {
        // Arrange
        Instant existingTimestamp = Instant.now().minus(1, ChronoUnit.DAYS);
        testUser.setTermsAcceptedAt(existingTimestamp);
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));

        // Act
        accountService.recordTermsAcceptance(userId);

        // Assert
        verify(userRepository, never()).save(any());
    }
}
