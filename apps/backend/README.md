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

### API Controllers

**AuthController** (`/v1/auth`)

- `POST /register` - User registration
- `POST /login` - Login (returns access token + refresh token cookie)
- `POST /logout` - Logout and revoke tokens
- `POST /refresh` - Refresh access token

**AccountController** (`/v1/api/account`)

- `GET /` - Get current user profile
- `PUT /profile` - Update profile (display name, email)
- `PUT /password` - Change password
- `PUT /preferences` - Update preferences (theme)
- `DELETE /` - Delete account
- `POST /forgot-password` - Initiate password reset
- `POST /reset-password` - Complete password reset

**DashboardController** (`/v1/dashboard`)

- `GET /stats` - Get dashboard statistics

**CategoryController** (`/v1/categories`)

- `GET /` - List all categories (global)

**IngredientController** (`/v1/ingredients`)

- `GET /` - List ingredients (paginated, with search & filter)
- `GET /{id}` - Get ingredient by ID
- `POST /` - Create ingredient
- `PATCH /{id}` - Update ingredient
- `DELETE /{id}` - Delete ingredient

**RecipeController** (`/v1/recipes`)

- `GET /` - List recipes (paginated, with search)
- `GET /{id}` - Get recipe by ID
- `POST /` - Create recipe
- `PATCH /{id}` - Update recipe
- `DELETE /{id}` - Delete recipe

**PlannerController** (`/v1/planner/weeks`)

- `GET /` - List planner weeks (with date range filter)
- `GET /{id}` - Get planner week by ID
- `POST /` - Create planner week
- `PATCH /{id}` - Update planner week
- `DELETE /{id}` - Delete planner week

**PantryController** (`/v1/pantry`)

- `GET /` - List pantry items (paginated)
- `GET /{id}` - Get pantry item by ID
- `POST /` - Create pantry item
- `PATCH /{id}` - Update pantry item
- `DELETE /{id}` - Delete pantry item

**GroceryController** (`/v1/grocery`)

- `POST /compute` - Generate grocery list from planner weeks
- `GET /{id}` - Get grocery list by ID
- `PATCH /{id}` - Update grocery list

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

```plaintext
src/main/java/com/mealmap/
├── config/          # Configuration classes
│   ├── CorsConfig.java
│   ├── SecurityConfig.java
│   └── WebSocketConfig.java
│
├── controller/      # REST API endpoints
│   ├── AccountController.java    # Account management
│   ├── AuthController.java       # Authentication
│   ├── CategoryController.java   # Ingredient categories
│   ├── DashboardController.java  # Dashboard stats
│   ├── GroceryController.java    # Grocery lists
│   ├── IngredientController.java # Ingredients
│   ├── PantryController.java     # Pantry items
│   ├── PlannerController.java    # Meal planning
│   └── RecipeController.java     # Recipes
│
├── dto/             # Data Transfer Objects
│   ├── UserDto.java
│   ├── auth/        # Auth DTOs (LoginRequest, RegisterRequest, etc.)
│   ├── account/     # Account DTOs (ProfileUpdateRequest, etc.)
│   └── model/dto/   # Feature DTOs (ingredient, recipe, pantry, etc.)
│
├── exception/       # Global exception handling
│   ├── GlobalExceptionHandler.java
│   └── Custom exception classes
│
├── mapper/          # MapStruct DTO mappers
│   ├── UserMapper.java
│   ├── IngredientMapper.java
│   ├── RecipeMapper.java
│   └── ... (other mappers)
│
├── model/           # Domain models
│   ├── entity/      # JPA entities
│   │   ├── User.java
│   │   ├── Household.java
│   │   ├── Profile.java
│   │   ├── Category.java
│   │   ├── Ingredient.java
│   │   ├── Recipe.java
│   │   ├── RecipeIngredient.java
│   │   ├── PlannerWeek.java
│   │   ├── PlannedMeal.java
│   │   ├── PantryItem.java
│   │   ├── GroceryList.java
│   │   └── GroceryItem.java
│   ├── embedded/    # Embeddable types
│   │   ├── Quantity.java
│   │   └── PackageSize.java
│   └── enums/       # Enumerations
│       ├── Unit.java
│       ├── UserRole.java
│       └── MealSlot.java
│
├── repository/      # Spring Data JPA repositories
│   ├── UserRepository.java
│   ├── CategoryRepository.java
│   ├── IngredientRepository.java
│   ├── RecipeRepository.java
│   ├── PlannerWeekRepository.java
│   ├── PantryItemRepository.java
│   └── GroceryListRepository.java
│
├── security/        # Security & JWT handling
│   ├── JwtService.java
│   ├── JwtAuthenticationFilter.java
│   └── SecurityUtils.java
│
├── service/         # Business logic
│   ├── AuthService.java
│   ├── AccountService.java
│   ├── DashboardService.java
│   ├── CategoryService.java
│   ├── IngredientService.java
│   ├── RecipeService.java
│   ├── PlannerService.java
│   ├── PantryService.java
│   ├── GroceryService.java
│   └── EmailService.java
│
└── MealMapApplication.java  # Main application class

src/main/resources/
├── db/migration/    # Flyway database migrations
│   ├── V1__Initial_schema.sql
│   ├── V2__Add_recipes.sql
│   ├── V3__Add_planner.sql
│   ├── V4__Add_pantry.sql
│   ├── V5__Add_grocery.sql
│   └── V6__Add_user_account_management_fields.sql
├── application.yml      # Default configuration
└── application-prod.yml # Production configuration
```
