# MealMap Frontend

React-based frontend for the MealMap meal planning application.

## Tech Stack

**Core:**

- React 18.2 + TypeScript
- Vite (build tool)
- React Router v6 (routing)

**State & Data:**

- TanStack Query v5 (React Query - server state)
- Zustand (global state - auth & theme)
- React Hook Form (form state)
- Zod (validation)

**Styling & UI:**

- TailwindCSS (utility-first CSS)
- Radix UI (accessible primitives)
- Framer Motion (animations)
- Lucide React (icons)
- Sonner (toast notifications)

**Features:**

- Axios (HTTP client with interceptors)
- dnd-kit (drag-and-drop)
- date-fns (date utilities)
- jsPDF + jsPDF-AutoTable (PDF export)
- PapaParse (CSV export)

**Testing:**

- Vitest
- React Testing Library

## Prerequisites

- Node.js 18+
- npm or yarn

## Getting Started

1. Navigate to the frontend directory:

   ```bash
   cd apps/frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features

- **Authentication** - Login, register, password reset via email
- **Account Management** - Profile editing, password changes, theme preferences, account deletion
- **Dashboard** - Overview statistics with quick action buttons
- **Ingredients** - Manage ingredient library with categories, units, and search
- **Recipes** - Create and manage recipes with ingredient lists and servings
- **Planner** - Weekly meal planning with drag-and-drop interface
- **Pantry** - Track pantry inventory with quantities and expiration dates
- **Grocery List** - Generate smart shopping lists from meal plans, export to CSV/PDF
- **Theme Support** - Dark/light/system theme with smooth transitions
- **Responsive Design** - Mobile, tablet, and desktop optimized

## Project Structure

```plaintext
src/
├── components/         # Reusable React components
│   ├── ui/            # Base UI components (Button, Input, Card, etc.)
│   ├── Layout.tsx     # Main layout with sidebar and header
│   ├── Sidebar.tsx    # Navigation sidebar (collapsible)
│   ├── Header.tsx     # Top header with user menu
│   └── ToastProvider.tsx
│
├── pages/              # Page components
│   ├── auth/          # Authentication pages
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   └── ResetPasswordPage.tsx
│   ├── legal/         # Legal pages
│   │   ├── TermsPage.tsx
│   │   └── PrivacyPage.tsx
│   ├── DashboardPage.tsx
│   ├── AccountPage.tsx
│   ├── IngredientsPage.tsx
│   ├── RecipesPage.tsx
│   ├── PlannerPage.tsx
│   ├── PantryPage.tsx
│   └── GroceryPage.tsx
│
├── services/           # API service layer
│   ├── auth.service.ts
│   ├── accountService.ts
│   ├── dashboard.service.ts
│   ├── ingredient.service.ts
│   ├── recipe.service.ts
│   ├── planner.service.ts
│   ├── pantry.service.ts
│   └── grocery.service.ts
│
├── store/              # Zustand stores
│   ├── authStore.ts   # Authentication state
│   └── themeStore.ts  # Theme preference state
│
├── lib/                # Utilities and helpers
│   ├── api.ts         # Axios instance with interceptors
│   ├── validation.ts  # Zod schemas for forms
│   └── utils.ts       # Utility functions
│
├── types/              # TypeScript type definitions
│   └── api.ts         # API response types
│
├── config/             # Configuration
│   └── index.ts       # Environment config
│
├── styles/             # Global styles
│   └── globals.css
│
├── test/               # Test utilities
│   └── setup.ts
│
├── App.tsx             # Main app component with routing
├── main.tsx            # Application entry point
└── index.css           # Root styles
```

## Configuration

### Environment Variables

Create a `.env` file (or use `.env.local`):

```env
VITE_API_BASE_URL=http://localhost:8080/v1
```

### Development Proxy

During development, Vite proxies `/v1` requests to `http://localhost:8080` (configured in `vite.config.ts`). This avoids CORS issues.

### Production

In production, set `VITE_API_BASE_URL` to your backend URL (e.g., `http://192.168.120.135:8080/v1`).

## Authentication

The app uses JWT tokens with automatic refresh:

- **Access Token**: Stored in localStorage (via Zustand), expires in 15 minutes
- **Refresh Token**: HttpOnly cookie, expires in 7 days
- **Auto-refresh**: Axios interceptor catches 401 errors and refreshes tokens
- **Protected Routes**: Routes wrapped with authentication guard
- **Logout**: Clears tokens and redirects to login

See `src/lib/api.ts` for the Axios interceptor implementation.

## Styling

This project uses TailwindCSS for styling. The theme can be customized in `tailwind.config.js`.
