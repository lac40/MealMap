package com.mealmap.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mealmap.dto.UserDto;
import com.mealmap.dto.account.*;
import com.mealmap.service.AccountService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Controller tests using standalone MockMvc setup (no Spring context/security).
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AccountController Tests (Standalone)")
class AccountControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private AccountService accountService;

    @InjectMocks
    private AccountController accountController;

    @BeforeEach
    void setup() {
        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();
        this.mockMvc = MockMvcBuilders.standaloneSetup(accountController)
                .setValidator(validator)
                .build();
    }

    // ===========================
    // GET /api/account Tests
    // ===========================

    @Test
    @DisplayName("GET /api/account - Should return current user")
    void getCurrentUser_Success() throws Exception {
        // Arrange
        UserDto userDto = UserDto.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .displayName("Test User")
                .emailVerified(true)
                .build();

        when(accountService.getCurrentUser()).thenReturn(userDto);

        // Act & Assert
        mockMvc.perform(get("/api/account"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.displayName").value("Test User"));

        verify(accountService).getCurrentUser();
    }

    // ===========================
    // PUT /api/account/profile Tests
    // ===========================

    @Test
    @DisplayName("PUT /api/account/profile - Should update profile successfully")
    void updateProfile_Success() throws Exception {
        // Arrange
        ProfileUpdateRequest request = new ProfileUpdateRequest();
        request.setDisplayName("Updated Name");
        request.setEmail("updated@example.com");

        UserDto updatedDto = UserDto.builder()
                .displayName("Updated Name")
                .email("updated@example.com")
                .build();

        when(accountService.updateProfile(any(ProfileUpdateRequest.class))).thenReturn(updatedDto);

        // Act & Assert
        mockMvc.perform(put("/api/account/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.displayName").value("Updated Name"))
                .andExpect(jsonPath("$.email").value("updated@example.com"));

        verify(accountService).updateProfile(any(ProfileUpdateRequest.class));
    }

    @Test
    @DisplayName("PUT /api/account/profile - Should return 400 for invalid data")
    void updateProfile_InvalidData() throws Exception {
        // Arrange - blank display name
        ProfileUpdateRequest request = new ProfileUpdateRequest();
        request.setDisplayName("");
        request.setEmail("test@example.com");

        // Act & Assert
        mockMvc.perform(put("/api/account/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(accountService, never()).updateProfile(any());
    }

    // ===========================
    // PUT /api/account/password Tests
    // ===========================

    @Test
    @DisplayName("PUT /api/account/password - Should change password successfully")
    void changePassword_Success() throws Exception {
        // Arrange
        PasswordChangeRequest request = new PasswordChangeRequest();
        request.setCurrentPassword("oldPassword123!");
        request.setNewPassword("newPassword456!");

        doNothing().when(accountService).changePassword(any(PasswordChangeRequest.class));

        // Act & Assert
        mockMvc.perform(put("/api/account/password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNoContent());

        verify(accountService).changePassword(any(PasswordChangeRequest.class));
    }

    @Test
    @DisplayName("PUT /api/account/password - Should return 400 for invalid password format")
    void changePassword_InvalidFormat() throws Exception {
        // Arrange - password too short
        PasswordChangeRequest request = new PasswordChangeRequest();
        request.setCurrentPassword("old123");
        request.setNewPassword("new");

        // Act & Assert
        mockMvc.perform(put("/api/account/password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(accountService, never()).changePassword(any());
    }

    // ===========================
    // PUT /api/account/preferences Tests
    // ===========================

    @Test
    @DisplayName("PUT /api/account/preferences - Should update preferences successfully")
    void updatePreferences_Success() throws Exception {
        // Arrange
        PreferencesUpdateRequest request = new PreferencesUpdateRequest();
        request.setThemePreference("dark");

        doNothing().when(accountService).updatePreferences(any(PreferencesUpdateRequest.class));

        // Act & Assert
        mockMvc.perform(put("/api/account/preferences")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNoContent());

        verify(accountService).updatePreferences(any(PreferencesUpdateRequest.class));
    }

    @Test
    @DisplayName("PUT /api/account/preferences - Should accept all theme values")
    void updatePreferences_AllThemeValues() throws Exception {
        // Test light, dark, and system themes
        String[] themes = {"light", "dark", "system"};

        for (String theme : themes) {
            PreferencesUpdateRequest request = new PreferencesUpdateRequest();
            request.setThemePreference(theme);

            mockMvc.perform(put("/api/account/preferences")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNoContent());
        }

        verify(accountService, times(3)).updatePreferences(any(PreferencesUpdateRequest.class));
    }

    // ===========================
    // DELETE /api/account Tests
    // ===========================

    @Test
    @DisplayName("DELETE /api/account - Should delete account successfully")
    void deleteAccount_Success() throws Exception {
        // Arrange
        doNothing().when(accountService).deleteAccount();

        // Act & Assert
        mockMvc.perform(delete("/api/account"))
            .andExpect(status().isNoContent());

        verify(accountService).deleteAccount();
        }

    // ===========================
    // POST /api/account/forgot-password Tests
    // ===========================

    @Test
    @DisplayName("POST /api/account/forgot-password - Should process valid email")
    void forgotPassword_ValidEmail() throws Exception {
        // Arrange
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("test@example.com");

        doNothing().when(accountService).forgotPassword(any(ForgotPasswordRequest.class));

        // Act & Assert
        mockMvc.perform(post("/api/account/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        verify(accountService).forgotPassword(any(ForgotPasswordRequest.class));
    }

    @Test
    @DisplayName("POST /api/account/forgot-password - Should return 400 for invalid email")
    void forgotPassword_InvalidEmail() throws Exception {
        // Arrange
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("not-an-email");

        // Act & Assert
        mockMvc.perform(post("/api/account/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(accountService, never()).forgotPassword(any());
    }

    // ===========================
    // POST /api/account/reset-password Tests
    // ===========================

    @Test
    @DisplayName("POST /api/account/reset-password - Should reset password with valid token")
    void resetPassword_ValidToken() throws Exception {
        // Arrange
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken(UUID.randomUUID().toString());
        request.setNewPassword("newPassword123!");

        doNothing().when(accountService).resetPassword(any(ResetPasswordRequest.class));

        // Act & Assert
        mockMvc.perform(post("/api/account/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNoContent());

        verify(accountService).resetPassword(any(ResetPasswordRequest.class));
    }

    @Test
    @DisplayName("POST /api/account/reset-password - Should return 400 for invalid data")
    void resetPassword_InvalidData() throws Exception {
        // Arrange - missing token
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setNewPassword("newPassword123!");

        // Act & Assert
        mockMvc.perform(post("/api/account/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(accountService, never()).resetPassword(any());
    }
}
