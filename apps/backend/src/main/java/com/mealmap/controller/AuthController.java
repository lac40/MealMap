package com.mealmap.controller;

import com.mealmap.dto.UserDto;
import com.mealmap.dto.auth.LoginRequest;
import com.mealmap.dto.auth.LoginResponse;
import com.mealmap.dto.auth.RegisterRequest;
import com.mealmap.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.WebUtils;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    private final com.mealmap.security.JwtService jwtService;
    private final UserDetailsService userDetailsService;
    
    @Value("${jwt.expiration}")
    private long accessTokenTtl;
    
    @Value("${jwt.refresh-expiration}")
    private long refreshTokenTtl;
    
    private static final String REFRESH_TOKEN_COOKIE = "refreshToken";
    
    @PostMapping("/register")
    public ResponseEntity<UserDto> register(@Valid @RequestBody RegisterRequest request) {
        UserDto user = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7).trim();
            if (!token.isEmpty()) {
                jwtService.revokeToken(token);
            }
        }
        org.springframework.security.core.context.SecurityContextHolder.clearContext();
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refresh(HttpServletRequest request, HttpServletResponse response) {
        Cookie refreshCookie = WebUtils.getCookie(request, REFRESH_TOKEN_COOKIE);

        if (refreshCookie == null) {
            clearRefreshCookie(response, request.isSecure());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String refreshToken = refreshCookie.getValue();

        if (refreshToken == null || refreshToken.isBlank() || jwtService.isTokenRevoked(refreshToken)) {
            clearRefreshCookie(response, request.isSecure());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            String username = jwtService.extractUsername(refreshToken);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (!jwtService.isTokenValid(refreshToken, userDetails)) {
                clearRefreshCookie(response, request.isSecure());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
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

            Map<String, Object> body = new HashMap<>();
            body.put("accessToken", newAccessToken);
            body.put("expiresIn", (int) (accessTokenTtl / 1000));

            return ResponseEntity.ok(body);
        } catch (Exception ex) {
            clearRefreshCookie(response, request.isSecure());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
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
