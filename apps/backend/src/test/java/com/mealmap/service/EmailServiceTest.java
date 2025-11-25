package com.mealmap.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("EmailService Tests")
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailService emailService;

    // ===========================
    // sendPasswordResetEmail Tests
    // ===========================

    @Test
    @DisplayName("Should send password reset email with correct content")
    void shouldSendPasswordResetEmailWithCorrectContent() {
        // Arrange
        ReflectionTestUtils.setField(emailService, "fromEmail", "noreply@mealmap.com");
        ReflectionTestUtils.setField(emailService, "frontendUrl", "http://localhost:5173");
        String toEmail = "test@example.com";
        String resetToken = "test-token-123";
        doNothing().when(mailSender).send(any(SimpleMailMessage.class));

        // Act
        emailService.sendPasswordResetEmail(toEmail, resetToken);

        // Assert
        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(messageCaptor.capture());
        SimpleMailMessage sentMessage = messageCaptor.getValue();
        
        assertThat(sentMessage.getTo()).containsExactly(toEmail);
        assertThat(sentMessage.getFrom()).isEqualTo("noreply@mealmap.com");
        assertThat(sentMessage.getSubject()).isEqualTo("MealMap - Password Reset Request");
        assertThat(sentMessage.getText()).contains("http://localhost:5173/reset-password?token=test-token-123");
        assertThat(sentMessage.getText()).contains("reset your password");
    }

    @Test
    @DisplayName("Should handle null frontend URL gracefully")
    void shouldHandleNullFrontendUrlGracefully() {
        // Arrange
        ReflectionTestUtils.setField(emailService, "fromEmail", "noreply@mealmap.com");
        ReflectionTestUtils.setField(emailService, "frontendUrl", null);
        doNothing().when(mailSender).send(any(SimpleMailMessage.class));

        // Act
        emailService.sendPasswordResetEmail("test@example.com", "token");

        // Assert - Should still send email, just with null in URL
        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    // ===========================
    // sendWelcomeEmail Tests
    // ===========================

    @Test
    @DisplayName("Should send welcome email with correct content")
    void shouldSendWelcomeEmailWithCorrectContent() {
        // Arrange
        ReflectionTestUtils.setField(emailService, "fromEmail", "noreply@mealmap.com");
        String toEmail = "newuser@example.com";
        String displayName = "John Doe";
        doNothing().when(mailSender).send(any(SimpleMailMessage.class));

        // Act
        emailService.sendWelcomeEmail(toEmail, displayName);

        // Assert
        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(messageCaptor.capture());
        SimpleMailMessage sentMessage = messageCaptor.getValue();
        
        assertThat(sentMessage.getTo()).containsExactly(toEmail);
        assertThat(sentMessage.getFrom()).isEqualTo("noreply@mealmap.com");
        assertThat(sentMessage.getSubject()).isEqualTo("Welcome to MealMap!");
        assertThat(sentMessage.getText()).contains("John Doe");
        assertThat(sentMessage.getText()).contains("Welcome to MealMap");
    }

    @Test
    @DisplayName("Should send welcome email even with null display name")
    void shouldSendWelcomeEmailEvenWithNullDisplayName() {
        // Arrange
        ReflectionTestUtils.setField(emailService, "fromEmail", "noreply@mealmap.com");
        doNothing().when(mailSender).send(any(SimpleMailMessage.class));

        // Act
        emailService.sendWelcomeEmail("test@example.com", null);

        // Assert
        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    // ===========================
    // sendAccountDeletionEmail Tests
    // ===========================

    @Test
    @DisplayName("Should send account deletion email with correct content")
    void shouldSendAccountDeletionEmailWithCorrectContent() {
        // Arrange
        ReflectionTestUtils.setField(emailService, "fromEmail", "noreply@mealmap.com");
        String toEmail = "deleteduser@example.com";
        String displayName = "Jane Smith";
        doNothing().when(mailSender).send(any(SimpleMailMessage.class));

        // Act
        emailService.sendAccountDeletionEmail(toEmail, displayName);

        // Assert
        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(messageCaptor.capture());
        SimpleMailMessage sentMessage = messageCaptor.getValue();
        
        assertThat(sentMessage.getTo()).containsExactly(toEmail);
        assertThat(sentMessage.getFrom()).isEqualTo("noreply@mealmap.com");
        assertThat(sentMessage.getSubject()).isEqualTo("MealMap - Account Deleted");
        assertThat(sentMessage.getText()).contains("Jane Smith");
        assertThat(sentMessage.getText()).contains("deleted");
    }

    @Test
    @DisplayName("Should handle email sending exceptions gracefully")
    void shouldHandleEmailSendingExceptionsGracefully() {
        // Arrange
        ReflectionTestUtils.setField(emailService, "fromEmail", "noreply@mealmap.com");
        ReflectionTestUtils.setField(emailService, "frontendUrl", "http://localhost:5173");
        doThrow(new RuntimeException("SMTP server unavailable")).when(mailSender).send(any(SimpleMailMessage.class));

        // Act & Assert - Should log error but not throw exception (async method)
        assertThatCode(() -> emailService.sendPasswordResetEmail("test@example.com", "token"))
                .doesNotThrowAnyException();
        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    // ===========================
    // Email Format Validation Tests
    // ===========================

    @Test
    @DisplayName("Should send emails with all required fields")
    void shouldSendEmailsWithAllRequiredFields() {
        // Arrange
        ReflectionTestUtils.setField(emailService, "fromEmail", "noreply@mealmap.com");
        ReflectionTestUtils.setField(emailService, "frontendUrl", "http://localhost:5173");
        doNothing().when(mailSender).send(any(SimpleMailMessage.class));

        // Act
        emailService.sendPasswordResetEmail("test@example.com", "token");

        // Assert
        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(messageCaptor.capture());
        SimpleMailMessage sentMessage = messageCaptor.getValue();
        
        // Verify all required fields are present
        assertThat(sentMessage.getTo()).isNotNull();
        assertThat(sentMessage.getFrom()).isNotNull();
        assertThat(sentMessage.getSubject()).isNotNull();
        assertThat(sentMessage.getText()).isNotNull();
    }

    @Test
    @DisplayName("Should include reset link in password reset email")
    void shouldIncludeResetLinkInPasswordResetEmail() {
        // Arrange
        ReflectionTestUtils.setField(emailService, "fromEmail", "noreply@mealmap.com");
        ReflectionTestUtils.setField(emailService, "frontendUrl", "http://localhost:5173");
        String resetToken = "unique-token-456";
        doNothing().when(mailSender).send(any(SimpleMailMessage.class));

        // Act
        emailService.sendPasswordResetEmail("test@example.com", resetToken);

        // Assert
        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(messageCaptor.capture());
        SimpleMailMessage sentMessage = messageCaptor.getValue();
        
        String expectedLink = "http://localhost:5173/reset-password?token=" + resetToken;
        assertThat(sentMessage.getText()).contains(expectedLink);
    }
}
