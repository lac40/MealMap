# MealMap Backend

Backend API for the MealMap meal planning application, built with Spring Boot.

## Tech Stack

- Java 21
- Spring Boot 3.2.0
- Spring Security with JWT authentication
- Spring Data JPA
- MS SQL Server (development and production)
- Flyway for database migrations
- Gradle

## Prerequisites

- Java 21 or higher
- Gradle 8.0+ (or use included Gradle Wrapper)
- MS SQL Server 2019+ (or SQL Server Express)

## Getting Started

### Development Mode

1. **Start MS SQL Server** (Docker option):
   ```bash
   docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong@Passw0rd" \
     -p 1433:1433 --name mealmap-sqlserver \
     -d mcr.microsoft.com/mssql/server:2022-latest
   ```

2. **Create database**:
   ```bash
   docker exec -it mealmap-sqlserver /opt/mssql-tools/bin/sqlcmd \
     -S localhost -U SA -P 'YourStrong@Passw0rd' \
     -Q 'CREATE DATABASE mealmap'
   ```

3. Navigate to the backend directory:
   ```bash
   cd apps/backend
   ```

4. Run the application:
   ```bash
   ./gradlew bootRun
   ```

The backend will start on `http://localhost:8080/v1`

### Database Connection

Default development connection:
- **Host**: localhost
- **Port**: 1433
- **Database**: mealmap
- **Username**: sa
- **Password**: YourStrong@Passw0rd

Override via environment variables if needed.

## API Documentation

Once the application is running, Swagger UI is available at:
`http://localhost:8080/v1/swagger-ui.html`

## Configuration

Configuration is managed through `application.yml` and `application-prod.yml`.

Key environment variables:
- `JWT_SECRET`: Secret key for JWT token generation
- `DB_HOST`: MS SQL Server host (default: localhost)
- `DB_PORT`: MS SQL Server port (default: 1433)
- `DB_NAME`: Database name (default: mealmap)
- `DB_USER`: Database username (default: sa)
- `DB_PASSWORD`: Database password

## Building

```bash
./gradlew build
```

The executable JAR will be created in `build/libs/mealmap-backend-1.0.0-SNAPSHOT.jar`

## Running Tests

```bash
./gradlew test
```

## Database Migrations

Flyway migrations are located in `src/main/resources/db/migration/`. They run automatically on application startup.

## Project Structure

```
src/main/java/com/mealmap/
├── config/          # Configuration classes
├── model/           # Domain models
│   ├── entity/      # JPA entities
│   ├── embedded/    # Embeddable types
│   └── enums/       # Enumerations
├── repository/      # Spring Data repositories
├── service/         # Business logic
├── security/        # Security & JWT handling
└── MealMapApplication.java
```
