package com.mealmap.service;

import com.mealmap.dto.UserDto;
import com.mealmap.dto.auth.LoginRequest;
import com.mealmap.dto.auth.LoginResponse;
import com.mealmap.dto.auth.RegisterRequest;
import com.mealmap.model.entity.User;
import com.mealmap.repository.UserRepository;
import com.mealmap.security.JwtService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.WebUtils;

import java.time.Duration;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AccountService accountService;
    private final EmailService emailService;

    @Value("${jwt.expiration}")
    private long accessTokenTtl;

    @Value("${jwt.refresh-expiration}")
    private long refreshTokenTtl;

    private static final String REFRESH_TOKEN_COOKIE = "refreshToken";
    
    @Transactional
    public UserDto register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("User already exists");
        }
        
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .displayName(request.getDisplayName())
                .mfaEnabled(false)
                .emailVerified(false)
                .themePreference("system")
                .build();
        
        User savedUser = userRepository.save(user);
        
        // Record terms acceptance
        accountService.recordTermsAcceptance(savedUser.getId());
        
        // Send welcome email
        emailService.sendWelcomeEmail(savedUser.getEmail(), savedUser.getDisplayName());
        
        return mapToDto(savedUser);
    }
    
    @Transactional
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials");
        }
        
        // Update last login timestamp
        accountService.updateLastLogin(user.getId());
        
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                new ArrayList<>()
        );
        
        String accessToken = jwtService.generateToken(userDetails);
        
        return LoginResponse.builder()
                .accessToken(accessToken)
                .expiresIn(900)
                .user(mapToDto(user))
                .build();
    }

    @Transactional(readOnly = true)
    public void refreshTokens(HttpServletRequest request, HttpServletResponse response) {
        Cookie refreshCookie = WebUtils.getCookie(request, REFRESH_TOKEN_COOKIE);

        if (refreshCookie == null) {
            clearRefreshCookie(response, request.isSecure());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token missing");
        }

        String refreshToken = refreshCookie.getValue();

        if (refreshToken == null || refreshToken.isBlank() || jwtService.isTokenRevoked(refreshToken)) {
            clearRefreshCookie(response, request.isSecure());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token invalid");
        }

        try {
            String username = jwtService.extractUsername(refreshToken);

            User user = userRepository.findByEmail(username)
                    .orElseThrow(() -> {
                        clearRefreshCookie(response, request.isSecure());
                        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
                    });

            UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                    user.getEmail(),
                    user.getPasswordHash(),
                    new ArrayList<>()
            );

            if (!jwtService.isTokenValid(refreshToken, userDetails)) {
                clearRefreshCookie(response, request.isSecure());
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token validation failed");
            }

            jwtService.revokeToken(refreshToken);

            String newAccessToken = jwtService.generateToken(userDetails);
            String newRefreshToken = jwtService.generateRefreshToken(userDetails);

            boolean secure = request.isSecure();
            String sameSite = secure ? "None" : "Lax";

            ResponseCookie newCookie = ResponseCookie.from(REFRESH_TOKEN_COOKIE, newRefreshToken)
                    .httpOnly(true)
                    .secure(secure)
                    .sameSite(sameSite)
                    .path("/")
                    .maxAge(Duration.ofMillis(refreshTokenTtl))
                    .build();

            response.addHeader(HttpHeaders.SET_COOKIE, newCookie.toString());
            response.setHeader("X-Access-Token", newAccessToken);
            response.setHeader("X-Expires-In", String.valueOf(accessTokenTtl / 1000));
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            clearRefreshCookie(response, request.isSecure());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unable to refresh token");
        }
    }
    
    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .createdAt(user.getCreatedAt())
                .householdId(user.getHousehold() != null ? user.getHousehold().getId() : null)
                .mfaEnabled(user.getMfaEnabled())
                .emailVerified(user.getEmailVerified())
                .build();
    }

    private void clearRefreshCookie(HttpServletResponse response, boolean secure) {
        String sameSite = secure ? "None" : "Lax";

        ResponseCookie clearedCookie = ResponseCookie.from(REFRESH_TOKEN_COOKIE, "")
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path("/")
                .maxAge(Duration.ZERO)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, clearedCookie.toString());
    }
}
