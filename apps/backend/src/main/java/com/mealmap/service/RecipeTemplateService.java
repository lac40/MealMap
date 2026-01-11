package com.mealmap.service;

import com.mealmap.model.dto.recipe.CreateRecipeTemplateRequest;
import com.mealmap.model.dto.recipe.RecipeDto;
import com.mealmap.model.dto.recipe.RecipeItemDto;
import com.mealmap.model.dto.recipe.RecipeTemplateDuplicateRequest;
import com.mealmap.model.dto.recipe.RecipeTemplateDto;
import com.mealmap.model.dto.recipe.RecipeTemplatePageResponse;
import com.mealmap.model.dto.recipe.RecipeTemplatePreferencesRequest;
import com.mealmap.model.dto.recipe.UpdateRecipeTemplateRequest;
import com.mealmap.model.entity.Recipe;
import com.mealmap.model.entity.RecipeItem;
import com.mealmap.model.entity.RecipeTemplate;
import com.mealmap.model.entity.RecipeTemplateItem;
import com.mealmap.model.entity.RecipeTemplatePreference;
import com.mealmap.model.entity.User;
import com.mealmap.model.enums.RecipeTemplateSource;
import com.mealmap.repository.RecipeRepository;
import com.mealmap.repository.RecipeTemplatePreferenceRepository;
import com.mealmap.repository.RecipeTemplateRepository;
import com.mealmap.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Arrays;
import java.util.Base64;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecipeTemplateService {

    private final RecipeTemplateRepository templateRepository;
    private final RecipeTemplatePreferenceRepository preferenceRepository;
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public RecipeTemplatePageResponse getTemplates(Integer limit, String cursor, String query) {
        User currentUser = getCurrentUser();
        Pageable pageable = PageRequest.of(decodeCursor(cursor), limit != null ? limit : 20);

        Page<RecipeTemplate> page;
        if (query != null && !query.isBlank()) {
            page = templateRepository.findVisibleTemplatesByName(currentUser.getId(), RecipeTemplateSource.global, query, pageable);
        } else {
            page = templateRepository.findVisibleTemplates(currentUser.getId(), RecipeTemplateSource.global, pageable);
        }

        Map<UUID, RecipeTemplatePreference> preferences = loadPreferences(currentUser.getId(), page.getContent());

        List<RecipeTemplateDto> data = page.getContent().stream()
                .filter(template -> !isHidden(template.getId(), preferences))
                .map(template -> mapToDto(template, preferences.get(template.getId())))
                .toList();

        String nextCursor = page.hasNext()
                ? Base64.getEncoder().encodeToString(String.valueOf(page.getNumber() + 1).getBytes())
                : null;

        return RecipeTemplatePageResponse.builder()
                .data(data)
                .nextCursor(nextCursor)
                .build();
    }

    @Transactional(readOnly = true)
    public RecipeTemplateDto getTemplate(UUID id) {
        User currentUser = getCurrentUser();
        RecipeTemplate template = templateRepository.findWithItemsById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Template not found"));
        ensureAccessible(template, currentUser);

        RecipeTemplatePreference pref = preferenceRepository.findByTemplateIdAndUserId(id, currentUser.getId())
                .orElse(null);
        return mapToDto(template, pref);
    }

    @Transactional
    public RecipeTemplateDto createTemplate(CreateRecipeTemplateRequest request) {
        User currentUser = getCurrentUser();

        RecipeTemplate template = RecipeTemplate.builder()
                .name(request.getName())
                .description(request.getDescription())
                .tags(joinTags(request.getTags()))
                .dietaryTags(joinTags(request.getDietaryTags()))
                .source(RecipeTemplateSource.user)
                .ownerUserId(currentUser.getId())
                .immutable(false)
                .build();

        List<RecipeItemDto> itemDtos = request.getItems() != null ? request.getItems() : Collections.emptyList();
        List<RecipeTemplateItem> items = itemDtos.stream()
            .map(itemDto -> RecipeTemplateItem.builder()
                .template(template)
                .ingredientId(itemDto.getIngredientId())
                .quantity(itemDto.getQuantity())
                .packageNote(itemDto.getPackageNote())
                .build())
            .toList();

        items.forEach(item -> item.setTemplate(template));
        template.setItems(items);

        RecipeTemplate saved = templateRepository.save(template);
        return mapToDto(saved, null);
    }

    @Transactional
    public RecipeTemplateDto updateTemplate(UUID id, UpdateRecipeTemplateRequest request) {
        User currentUser = getCurrentUser();
        RecipeTemplate template = templateRepository.findWithItemsById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Template not found"));

        ensureCanModify(template, currentUser);

        if (request.getName() != null) {
            template.setName(request.getName());
        }
        if (request.getDescription() != null) {
            template.setDescription(request.getDescription());
        }
        if (request.getTags() != null) {
            template.setTags(joinTags(request.getTags()));
        }
        if (request.getDietaryTags() != null) {
            template.setDietaryTags(joinTags(request.getDietaryTags()));
        }
        if (request.getItems() != null) {
            template.getItems().clear();
            List<RecipeTemplateItem> newItems = request.getItems().stream()
                .map(itemDto -> RecipeTemplateItem.builder()
                            .template(template)
                            .ingredientId(itemDto.getIngredientId())
                            .quantity(itemDto.getQuantity())
                            .packageNote(itemDto.getPackageNote())
                            .build())
                    .toList();
            template.getItems().addAll(newItems);
        }

        RecipeTemplate saved = templateRepository.save(template);
        RecipeTemplatePreference pref = preferenceRepository.findByTemplateIdAndUserId(id, currentUser.getId())
                .orElse(null);
        return mapToDto(saved, pref);
    }

    @Transactional
    public void deleteTemplate(UUID id) {
        User currentUser = getCurrentUser();
        RecipeTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Template not found"));

        ensureCanModify(template, currentUser);
        templateRepository.delete(template);
    }

    @Transactional
    public RecipeTemplateDto updatePreferences(UUID id, RecipeTemplatePreferencesRequest request) {
        User currentUser = getCurrentUser();
        RecipeTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Template not found"));
        ensureAccessible(template, currentUser);

        RecipeTemplatePreference pref = preferenceRepository.findByTemplateIdAndUserId(id, currentUser.getId())
                .orElseGet(() -> RecipeTemplatePreference.builder()
                        .templateId(id)
                        .userId(currentUser.getId())
                        .favorite(false)
                        .hidden(false)
                        .build());

        if (request.getFavorite() != null) {
            pref.setFavorite(request.getFavorite());
        }
        if (request.getHidden() != null) {
            pref.setHidden(request.getHidden());
        }
        pref.setUpdatedAt(Instant.now());

        preferenceRepository.save(pref);
        return mapToDto(template, pref);
    }

    @Transactional
    public RecipeDto duplicateTemplate(UUID id, RecipeTemplateDuplicateRequest request) {
        User currentUser = getCurrentUser();
        RecipeTemplate template = templateRepository.findWithItemsById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Template not found"));
        ensureAccessible(template, currentUser);

        Recipe recipe = Recipe.builder()
                .ownerUserId(currentUser.getId())
                .name(request.getName() != null && !request.getName().isBlank() ? request.getName() : template.getName())
            .externalUrl(request.getExternalUrl())
            .notes(request.getNotes())
                .build();

        List<RecipeItem> items = template.getItems().stream()
                .map(item -> RecipeItem.builder()
                        .recipe(recipe)
                        .ingredientId(item.getIngredientId())
                        .quantity(item.getQuantity())
                        .packageNote(item.getPackageNote())
                        .build())
                .toList();
        recipe.setItems(items);

        Recipe saved = recipeRepository.save(recipe);
        return mapToRecipeDto(saved);
    }

    private Map<UUID, RecipeTemplatePreference> loadPreferences(UUID userId, List<RecipeTemplate> templates) {
        if (templates.isEmpty()) {
            return Collections.emptyMap();
        }
        List<UUID> ids = templates.stream().map(RecipeTemplate::getId).toList();
        return preferenceRepository.findByUserIdAndTemplateIdIn(userId, ids).stream()
                .collect(Collectors.toMap(RecipeTemplatePreference::getTemplateId, pref -> pref));
    }

    private boolean isHidden(UUID templateId, Map<UUID, RecipeTemplatePreference> preferences) {
        RecipeTemplatePreference pref = preferences.get(templateId);
        return pref != null && pref.isHidden();
    }

    private RecipeTemplateDto mapToDto(RecipeTemplate template, RecipeTemplatePreference pref) {
        List<RecipeItemDto> items = template.getItems().stream()
                .map(item -> RecipeItemDto.builder()
                        .ingredientId(item.getIngredientId())
                        .quantity(item.getQuantity())
                        .packageNote(item.getPackageNote())
                        .build())
                .toList();

        return RecipeTemplateDto.builder()
                .id(template.getId())
                .name(template.getName())
                .description(template.getDescription())
                .tags(splitTags(template.getTags()))
                .dietaryTags(splitTags(template.getDietaryTags()))
                .source(template.getSource())
                .ownerUserId(template.getOwnerUserId())
                .favorite(pref != null && pref.isFavorite())
                .hidden(pref != null && pref.isHidden())
                .immutable(template.isImmutable())
                .items(items)
                .createdAt(template.getCreatedAt())
                .updatedAt(template.getUpdatedAt())
                .build();
    }

    private RecipeDto mapToRecipeDto(Recipe recipe) {
        List<RecipeItemDto> items = recipe.getItems().stream()
                .map(item -> RecipeItemDto.builder()
                        .ingredientId(item.getIngredientId())
                        .quantity(item.getQuantity())
                        .packageNote(item.getPackageNote())
                        .build())
                .toList();

        return RecipeDto.builder()
                .id(recipe.getId())
                .name(recipe.getName())
                .externalUrl(recipe.getExternalUrl())
            .notes(recipe.getNotes())
                .items(items)
                .createdAt(recipe.getCreatedAt())
                .updatedAt(recipe.getUpdatedAt())
                .build();
    }

    private List<String> splitTags(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    private String joinTags(List<String> tags) {
        if (tags == null || tags.isEmpty()) {
            return null;
        }
        return tags.stream()
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.joining(","));
    }

    private void ensureAccessible(RecipeTemplate template, User currentUser) {
        if (template.getSource() == RecipeTemplateSource.global) {
            return;
        }
        if (template.getOwnerUserId() == null || !template.getOwnerUserId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to access this template");
        }
    }

    private void ensureCanModify(RecipeTemplate template, User currentUser) {
        if (template.isImmutable() || template.getSource() == RecipeTemplateSource.global) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Template is immutable");
        }
        ensureAccessible(template, currentUser);
    }

    private int decodeCursor(String cursor) {
        if (cursor == null) {
            return 0;
        }
        try {
            return Integer.parseInt(new String(Base64.getDecoder().decode(cursor)));
        } catch (IllegalArgumentException ex) {
            return 0;
        }
    }

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email;

        if (principal instanceof UserDetails userDetails) {
            email = userDetails.getUsername();
        } else {
            email = principal.toString();
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }
}
