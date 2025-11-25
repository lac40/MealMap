package com.mealmap.mapper;

import com.mealmap.dto.UserDto;
import com.mealmap.model.entity.User;
import org.springframework.stereotype.Component;

/**
 * Mapper for converting between User entities and UserDto
 */
@Component
public class UserMapper {

    /**
     * Convert User entity to UserDto
     * 
     * @param user User entity
     * @return UserDto
     */
    public UserDto toDto(User user) {
        if (user == null) {
            return null;
        }

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
