package com.mealmap.service;

import com.mealmap.dto.UserDto;
import com.mealmap.dto.auth.LoginRequest;
import com.mealmap.dto.auth.LoginResponse;
import com.mealmap.dto.auth.RegisterRequest;
import com.mealmap.model.entity.User;
import com.mealmap.repository.UserRepository;
import com.mealmap.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    
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
                .build();
        
        user = userRepository.save(user);
        return mapToDto(user);
    }
    
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials");
        }
        
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
}
