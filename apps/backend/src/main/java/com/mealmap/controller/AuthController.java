package com.mealmap.controller;

import com.mealmap.dto.UserDto;
import com.mealmap.dto.auth.LoginRequest;
import com.mealmap.dto.auth.LoginResponse;
import com.mealmap.dto.auth.RegisterRequest;
import com.mealmap.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    
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
    public ResponseEntity<Void> logout() {
        // TODO: Implement token revocation if needed
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<Void> refresh() {
        // TODO: Implement refresh token logic
        return ResponseEntity.noContent().build();
    }
}
