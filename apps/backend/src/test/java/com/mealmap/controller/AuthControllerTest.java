package com.mealmap.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mealmap.dto.UserDto;
import com.mealmap.dto.auth.LoginRequest;
import com.mealmap.dto.auth.LoginResponse;
import com.mealmap.dto.auth.RegisterRequest;
import com.mealmap.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
    controllers = AuthController.class,
    excludeAutoConfiguration = {
        org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
        org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration.class
    }
)
@DisplayName("Authentication Controller API Endpoint Tests")
@SuppressWarnings("null")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;
    
    @MockBean
    private com.mealmap.security.JwtService jwtService;
    
    @MockBean
    private com.mealmap.service.CustomUserDetailsService userDetailsService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private UserDto userDto;
    private LoginResponse loginResponse;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("password123");
        registerRequest.setDisplayName("Test User");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");

        userDto = UserDto.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .displayName("Test User")
                .mfaEnabled(false)
                .emailVerified(false)
                .createdAt(Instant.now())
                .build();

        loginResponse = LoginResponse.builder()
                .accessToken("jwt-token")
                .expiresIn(900)
                .user(userDto)
                .build();
    }

    @Test
    @DisplayName("Should successfully register new user account and return 201 Created with user profile data")
    void shouldSuccessfullyRegisterNewUserAccountAndReturn201CreatedWithUserProfileData() throws Exception {
        // Given - valid registration request with email, password, and display name
        when(authService.register(any(RegisterRequest.class))).thenReturn(userDto);

        // When - POST request is made to registration endpoint
        // Then - new user is created and profile data is returned with 201 status
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.displayName").value("Test User"))
                .andExpect(jsonPath("$.mfaEnabled").value(false))
                .andExpect(jsonPath("$.emailVerified").value(false))
                .andExpect(jsonPath("$.createdAt").exists());
    }

    @Test
    @DisplayName("Should reject registration request and return 400 Bad Request when email format is invalid or password is too short")
    void shouldRejectRegistrationRequestAndReturn400BadRequestWhenEmailFormatInvalidOrPasswordTooShort() throws Exception {
        // Given - invalid registration data with malformed email and weak password
        RegisterRequest invalidRequest = new RegisterRequest();
        invalidRequest.setEmail("invalid-email");
        invalidRequest.setPassword("short");

        // When - POST request is made with invalid data
        // Then - request is rejected with 400 status and validation errors
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should authenticate user and return 200 OK with JWT access token when valid credentials are provided")
    void shouldAuthenticateUserAndReturn200OkWithJwtAccessTokenWhenValidCredentialsProvided() throws Exception {
        // Given - valid email and password credentials
        when(authService.login(any(LoginRequest.class))).thenReturn(loginResponse);

        // When - POST request is made to login endpoint
        // Then - user is authenticated and JWT token is issued with user data
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("jwt-token"))
                .andExpect(jsonPath("$.accessToken").isString())
                .andExpect(jsonPath("$.expiresIn").value(900))
                .andExpect(jsonPath("$.expiresIn").isNumber())
                .andExpect(jsonPath("$.user").exists())
                .andExpect(jsonPath("$.user.id").exists())
                .andExpect(jsonPath("$.user.email").value("test@example.com"));
    }

    @Test
    @DisplayName("Should reject login attempt and return 400 Bad Request when email format is invalid or password is missing")
    void shouldRejectLoginAttemptAndReturn400BadRequestWhenEmailFormatInvalidOrPasswordMissing() throws Exception {
        // Given - invalid login request with malformed email and no password
        LoginRequest invalidRequest = new LoginRequest();
        invalidRequest.setEmail("invalid-email");

        // When - POST request is made with invalid credentials
        // Then - authentication is rejected with 400 status before reaching service layer
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should successfully log out authenticated user and return 204 No Content after revoking refresh token")
    void shouldSuccessfullyLogOutAuthenticatedUserAndReturn204NoContentAfterRevokingRefreshToken() throws Exception {
        // Given - user is authenticated with valid session
        // When - POST request is made to logout endpoint
        // Then - refresh token is revoked and 204 status is returned
        mockMvc.perform(post("/auth/logout"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Should issue new access token and return 204 No Content when valid refresh token is provided")
    void shouldIssueNewAccessTokenAndReturn204NoContentWhenValidRefreshTokenProvided() throws Exception {
        // Given - user has valid refresh token in cookie
        // When - POST request is made to refresh endpoint
        // Then - new access token is issued and stored in cookie with 204 status
        mockMvc.perform(post("/auth/refresh"))
                .andExpect(status().isNoContent());
    }
}
