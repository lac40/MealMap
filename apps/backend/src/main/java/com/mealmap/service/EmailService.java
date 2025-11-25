package com.mealmap.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Email Service
 * 
 * Handles sending emails for password resets and other notifications.
 * Uses Spring's JavaMailSender with async execution to avoid blocking.
 * 
 * Note: Email configuration must be set in application.yml or application.properties
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.email.from:noreply@mealmap.app}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    /**
     * Send password reset email with token
     * Executed asynchronously to avoid blocking the request thread
     * 
     * @param to Recipient email address
     * @param token Password reset token
     */
    @Async
    public void sendPasswordResetEmail(String to, String token) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("MealMap - Password Reset Request");
            
            String resetLink = frontendUrl + "/reset-password?token=" + token;
            
            message.setText(String.format(
                "Hello,\n\n" +
                "You have requested to reset your password for your MealMap account.\n\n" +
                "Please click the link below to reset your password:\n" +
                "%s\n\n" +
                "This link will expire in 1 hour.\n\n" +
                "If you did not request this password reset, please ignore this email.\n\n" +
                "Best regards,\n" +
                "MealMap Team\n\n" +
                "---\n" +
                "This is an automated message from a university project. " +
                "For questions, contact: l.kornis@student.fontys.nl",
                resetLink
            ));
            
            mailSender.send(message);
            log.info("Password reset email sent to: {}", to);
            
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", to, e);
            // In a production app, you might want to retry or alert administrators
        }
    }

    /**
     * Send welcome email to new users
     * 
     * @param to Recipient email address
     * @param displayName User's display name
     */
    @Async
    public void sendWelcomeEmail(String to, String displayName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Welcome to MealMap!");
            
            message.setText(String.format(
                "Hello %s,\n\n" +
                "Welcome to MealMap! Your account has been successfully created.\n\n" +
                "You can now start planning your meals and managing your grocery lists.\n\n" +
                "Features you can explore:\n" +
                "• Create custom ingredients\n" +
                "• Build recipes from your ingredients\n" +
                "• Plan your meals for the week\n" +
                "• Generate grocery lists automatically\n" +
                "• Track your pantry inventory\n\n" +
                "If you have any questions or feedback, feel free to reach out.\n\n" +
                "Happy meal planning!\n" +
                "MealMap Team\n\n" +
                "---\n" +
                "This is a university project by Laszlo Kornis (Fontys S3).\n" +
                "Contact: l.kornis@student.fontys.nl",
                displayName
            ));
            
            mailSender.send(message);
            log.info("Welcome email sent to: {}", to);
            
        } catch (Exception e) {
            log.error("Failed to send welcome email to: {}", to, e);
        }
    }

    /**
     * Send account deletion confirmation email
     * 
     * @param to Recipient email address
     * @param displayName User's display name
     */
    @Async
    public void sendAccountDeletionEmail(String to, String displayName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("MealMap - Account Deleted");
            
            message.setText(String.format(
                "Hello %s,\n\n" +
                "Your MealMap account has been successfully deleted.\n\n" +
                "All your data including meal plans, recipes, and lists have been permanently removed.\n\n" +
                "If you did not request this deletion, please contact us immediately.\n\n" +
                "We're sorry to see you go. Thank you for using MealMap!\n\n" +
                "Best regards,\n" +
                "MealMap Team\n\n" +
                "---\n" +
                "Contact: l.kornis@student.fontys.nl",
                displayName
            ));
            
            mailSender.send(message);
            log.info("Account deletion confirmation sent to: {}", to);
            
        } catch (Exception e) {
            log.error("Failed to send account deletion email to: {}", to, e);
        }
    }
}
