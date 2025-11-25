package com.mealmap.controller;

import com.mealmap.service.AccountService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

/**
 * Security integration test using full SpringBootTest with in-memory H2 and Flyway disabled.
 * Verifies unauthenticated access to protected endpoint returns an error status (401/403).
 */
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=none",
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=LEGACY",
        "spring.datasource.driverClassName=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password="
})
@DisplayName("AccountController Security Tests")
class AccountControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AccountService accountService; // mocked business service (methods not invoked when unauthorized)

    @Test
    @DisplayName("GET /api/account without auth should return 401 or 403")
    void getCurrentUser_UnauthenticatedShouldFail() throws Exception {
        mockMvc.perform(get("/api/account"))
            .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
            .andExpect(result -> {
                int status = result.getResponse().getStatus();
                if (status != 401 && status != 403) {
                    throw new AssertionError("Expected 401 or 403, got " + status);
                }
            });
    }
}