# MealMap

A comprehensive meal planning application with grocery list generation, ingredient management, and collaboration features.

## Overview

MealMap helps users plan their weekly meals, manage ingredients, create recipes, and automatically generate optimized grocery lists. The application supports both personal and household meal planning with real-time collaboration features.

## Architecture

This project follows a monorepo structure with separate frontend and backend applications:

```
MealMap/
├── api/                    # OpenAPI specification (contract-first)
│   └── openapi.v1.json    # API contract
├── apps/
│   ├── backend/           # Spring Boot backend
│   └── frontend/          # React + TypeScript frontend
└── docs/                  # Documentation
```

## Features

### Core Features
- ✅ **User Authentication** - JWT-based secure authentication
- ✅ **Ingredient Management** - Create and manage user-scoped ingredients
- ✅ **Recipe Management** - Build recipes with ingredients and external links
- ✅ **Weekly Meal Planner** - Plan meals across configurable time slots
- ✅ **Pantry Tracking** - Track what you have at home
- ✅ **Smart Grocery Lists** - Auto-generate shopping lists from meal plans
- ✅ **Multi-trip Planning** - Split grocery shopping across multiple trips
- ✅ **Household Collaboration** - Share plans with household members
- ✅ **Export** - Export grocery lists as CSV/PDF

### Optional Features (Future)
- 🔄 Nutrition hints
- 🔄 Recipe import from URLs
- 🔄 Meal plan optimizer
- 🔄 Unit conversion & normalization
- 🔄 Ingredient substitutions
- 🔄 Barcode lookup
- 🔄 Receipt OCR

## Tech Stack

### Backend
- **Language**: Java 21
- **Framework**: Spring Boot 3.2.0
- **Database**: MS SQL Server (dev & prod)
- **Security**: Spring Security + JWT
- **API Documentation**: SpringDoc OpenAPI (Swagger)
- **Build Tool**: Gradle

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Routing**: React Router
- **HTTP Client**: Axios

## Getting Started

### Prerequisites
- Java 21+
- Node.js 18+
- Gradle 8.0+ (or use Gradle Wrapper)
- MS SQL Server 2019+ or SQL Server Express (or Docker)

### Backend Setup

#### Option 1: Using Docker Compose (Recommended)

1. **Start MS SQL Server with database initialization**:
   ```bash
   docker-compose up -d
   ```

   This will start MS SQL Server and automatically create the `mealmap` database.

#### Option 2: Manual Docker Setup

1. **Start MS SQL Server**:
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

#### Run the Backend

3. Navigate to backend directory:
   ```bash
   cd apps/backend
   ```

4. Run the application:
   ```bash
   ./gradlew bootRun
   ```

5. Backend will be available at: `http://localhost:8080/v1`

6. API documentation: `http://localhost:8080/v1/swagger-ui.html`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd apps/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Frontend will be available at: `http://localhost:5173`

## Development

### Running Both Applications

Terminal 1 (Backend):
```bash
cd apps/backend
./gradlew bootRun
```

Terminal 2 (Frontend):
```bash
cd apps/frontend
npm run dev
```

### Environment Variables

#### Backend
- `JWT_SECRET` - Secret for JWT signing
- `DB_HOST` - MS SQL Server host (default: localhost)
- `DB_PORT` - MS SQL Server port (default: 1433)
- `DB_NAME` - Database name (default: mealmap)
- `DB_USER` - Database username (default: sa)
- `DB_PASSWORD` - Database password

#### Frontend
The frontend automatically proxies API requests to `http://localhost:8080` during development.

## API Documentation

The API follows the OpenAPI 3.1.0 specification located in `api/openapi.v1.json`.

Key endpoint groups:
- `/auth/*` - Authentication
- `/ingredients` - Ingredient management
- `/recipes` - Recipe CRUD operations
- `/planner/weeks` - Weekly meal planning
- `/pantry` - Pantry inventory
- `/grocery/*` - Grocery list generation
- `/categories` - Global ingredient categories
- `/households` - Household management

## Database

### Development & Production
Both environments use **MS SQL Server**.

For local development with Docker:
```bash
# Start MS SQL Server container
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong@Passw0rd" \
  -p 1433:1433 --name mealmap-sqlserver \
  -d mcr.microsoft.com/mssql/server:2022-latest

# Create database
docker exec -it mealmap-sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U SA -P 'YourStrong@Passw0rd' \
  -Q 'CREATE DATABASE mealmap'
```

### Migrations
Flyway handles database migrations automatically. Migrations are in `apps/backend/src/main/resources/db/migration/`.

## Project Structure

See individual README files in `apps/backend` and `apps/frontend` for detailed structure.

## Security

- JWT tokens expire after 15 minutes (access) / 7 days (refresh)
- Passwords hashed with BCrypt
- CORS configured for local development
- Rate limiting enabled

## License

Proprietary
