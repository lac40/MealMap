package com.mealmap.service;

import com.mealmap.model.dto.recipe.CreateRecipeTemplateRequest;
import com.mealmap.model.dto.recipe.RecipeDto;
import com.mealmap.model.dto.recipe.RecipeItemDto;
import com.mealmap.model.dto.recipe.RecipeTemplateDuplicateRequest;
import com.mealmap.model.dto.recipe.RecipeTemplatePageResponse;
import com.mealmap.model.dto.recipe.RecipeTemplatePreferencesRequest;
import com.mealmap.model.embedded.Quantity;
import com.mealmap.model.entity.Recipe;
import com.mealmap.model.entity.RecipeTemplate;
import com.mealmap.model.entity.RecipeTemplateItem;
import com.mealmap.model.entity.RecipeTemplatePreference;
import com.mealmap.model.entity.User;
import com.mealmap.model.enums.RecipeTemplateSource;
import com.mealmap.model.enums.Unit;
import com.mealmap.repository.RecipeRepository;
import com.mealmap.repository.RecipeTemplatePreferenceRepository;
import com.mealmap.repository.RecipeTemplateRepository;
import com.mealmap.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("RecipeTemplateService business logic")
class RecipeTemplateServiceTest {

    @Mock
    private RecipeTemplateRepository templateRepository;

    @Mock
    private RecipeTemplatePreferenceRepository preferenceRepository;

    @Mock
    private RecipeRepository recipeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @Mock
    private UserDetails userDetails;

    @InjectMocks
    private RecipeTemplateService service;

    private User user;
    private RecipeTemplate globalTemplate;
    private RecipeTemplate userTemplate;
    private Quantity quantity;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(UUID.randomUUID())
                .email("user@example.com")
                .displayName("Test User")
                .build();

        quantity = Quantity.builder()
                .amount(new BigDecimal("1.0"))
                .unit(Unit.kg)
                .build();

        globalTemplate = RecipeTemplate.builder()
                .id(UUID.randomUUID())
                .name("Global Template")
                .source(RecipeTemplateSource.global)
                .immutable(true)
                .items(Arrays.asList(buildTemplateItem(null)))
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        globalTemplate.getItems().forEach(i -> i.setTemplate(globalTemplate));

        userTemplate = RecipeTemplate.builder()
                .id(UUID.randomUUID())
                .name("User Template")
                .source(RecipeTemplateSource.user)
                .ownerUserId(user.getId())
                .immutable(false)
                .items(Arrays.asList(buildTemplateItem(null)))
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        userTemplate.getItems().forEach(i -> i.setTemplate(userTemplate));

        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getUsername()).thenReturn(user.getEmail());
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
    }

    @Test
    @DisplayName("Lists templates and hides those marked hidden by the user")
    void getTemplates_filtersHidden() {
        RecipeTemplatePreference hiddenPref = RecipeTemplatePreference.builder()
                .id(UUID.randomUUID())
                .templateId(globalTemplate.getId())
                .userId(user.getId())
                .favorite(false)
                .hidden(true)
                .updatedAt(Instant.now())
                .build();

        Page<RecipeTemplate> page = new PageImpl<>(List.of(globalTemplate, userTemplate));
        when(templateRepository.findVisibleTemplates(eq(user.getId()), eq(RecipeTemplateSource.global), any(Pageable.class)))
                .thenReturn(page);
        when(preferenceRepository.findByUserIdAndTemplateIdIn(eq(user.getId()), any()))
                .thenReturn(List.of(hiddenPref));

        RecipeTemplatePageResponse response = service.getTemplates(10, null, null);

        assertThat(response.getData())
                .hasSize(1)
                .first()
                .satisfies(dto -> {
                    assertThat(dto.getId()).isEqualTo(userTemplate.getId());
                    assertThat(dto.isHidden()).isFalse();
                    assertThat(dto.isFavorite()).isFalse();
                    assertThat(dto.getItems()).hasSize(1);
                });
        assertThat(response.getNextCursor()).isNull();
    }

    @Test
    @DisplayName("Updates preferences and defaults missing flags")
    void updatePreferences_setsFlags() {
        when(templateRepository.findById(userTemplate.getId())).thenReturn(Optional.of(userTemplate));
        when(preferenceRepository.findByTemplateIdAndUserId(userTemplate.getId(), user.getId())).thenReturn(Optional.empty());
        when(preferenceRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        RecipeTemplatePreferencesRequest request = RecipeTemplatePreferencesRequest.builder()
                .favorite(true)
                .hidden(null)
                .build();

        var result = service.updatePreferences(userTemplate.getId(), request);

        assertThat(result.isFavorite()).isTrue();
        assertThat(result.isHidden()).isFalse();
    }

    @Test
    @DisplayName("Duplicate template creates recipe with items")
    void duplicateTemplate_copiesItems() {
        when(templateRepository.findWithItemsById(userTemplate.getId())).thenReturn(Optional.of(userTemplate));
        when(recipeRepository.save(any())).thenAnswer(invocation -> {
            Recipe saved = invocation.getArgument(0);
            saved.setId(UUID.randomUUID());
            return saved;
        });

        RecipeTemplateDuplicateRequest request = RecipeTemplateDuplicateRequest.builder()
                .name("Cloned")
                .externalUrl("https://example.com")
                .build();

        RecipeDto dto = service.duplicateTemplate(userTemplate.getId(), request);

        assertThat(dto.getName()).isEqualTo("Cloned");
        assertThat(dto.getItems()).hasSize(1);
        assertThat(dto.getId()).isNotNull();
    }

    @Test
    @DisplayName("Throws when accessing someone else's template")
    void getTemplate_forbiddenWhenNotOwner() {
        RecipeTemplate otherUserTemplate = RecipeTemplate.builder()
                .id(UUID.randomUUID())
                .name("Other")
                .source(RecipeTemplateSource.user)
                .ownerUserId(UUID.randomUUID())
                .immutable(false)
                .items(List.of())
                .build();

        when(templateRepository.findWithItemsById(otherUserTemplate.getId()))
                .thenReturn(Optional.of(otherUserTemplate));

        assertThatThrownBy(() -> service.getTemplate(otherUserTemplate.getId()))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Not authorized");
    }

    @Test
    @DisplayName("Creates user template with tags and items")
    void createTemplate_persistsItems() {
        when(templateRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        RecipeItemDto itemDto = RecipeItemDto.builder()
                .ingredientId(UUID.randomUUID())
                .quantity(quantity)
                .packageNote("note")
                .build();

        CreateRecipeTemplateRequest request = CreateRecipeTemplateRequest.builder()
                .name("My Template")
                .description("desc")
                .tags(List.of("tag1", "tag2"))
                .dietaryTags(List.of("veg"))
                .items(List.of(itemDto))
                .build();

        var result = service.createTemplate(request);

        assertThat(result.getName()).isEqualTo("My Template");
        assertThat(result.getItems()).hasSize(1);
        assertThat(result.getTags()).contains("tag1", "tag2");
        assertThat(result.getSource()).isEqualTo(RecipeTemplateSource.user);
    }

    private RecipeTemplateItem buildTemplateItem(RecipeTemplate template) {
        return RecipeTemplateItem.builder()
                .id(UUID.randomUUID())
                .template(template)
                .ingredientId(UUID.randomUUID())
                .quantity(quantity)
                .packageNote("note")
                .build();
    }
}
