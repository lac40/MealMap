package com.mealmap.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Async Configuration
 * 
 * Enables asynchronous method execution for @Async annotated methods.
 * Used primarily for email sending to prevent blocking HTTP requests.
 */
@Configuration
@EnableAsync
public class AsyncConfig {
    // Spring will use default executor configuration
    // For production, consider customizing the thread pool:
    // - Core pool size: 2-5 threads
    // - Max pool size: 10-20 threads
    // - Queue capacity: 100-500 tasks
}
