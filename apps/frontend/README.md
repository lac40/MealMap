# MealMap Frontend

React-based frontend for the MealMap meal planning application.

## Tech Stack

- React 18
- TypeScript
- Vite
- TailwindCSS
- React Router
- TanStack Query (React Query)
- Zustand (state management)
- Axios
- Lucide React (icons)

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

- **Dashboard** - Overview of your meal planning activities
- **Ingredients** - Manage your ingredient library
- **Recipes** - Create and manage recipes
- **Planner** - Weekly meal planning interface
- **Grocery List** - Generate shopping lists from meal plans

## Project Structure

```
src/
├── components/      # Reusable React components
├── pages/          # Page components
│   └── auth/       # Authentication pages
├── lib/            # Utilities and API client
├── store/          # Zustand state management
├── types/          # TypeScript type definitions
├── App.tsx         # Main app component
├── main.tsx        # Application entry point
└── index.css       # Global styles
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

The app uses JWT tokens for authentication. Tokens are stored in localStorage via Zustand persist middleware.

## Styling

This project uses TailwindCSS for styling. The theme can be customized in `tailwind.config.js`.
