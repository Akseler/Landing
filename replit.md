# AKSELER Landing Page

## Overview

AKSELER is a Lithuanian-language landing page for an AI-powered sales automation platform. The application presents AI workers/agents that handle customer inquiries, qualify leads, and schedule meetings automatically. The landing page follows a minimalist design philosophy inspired by modern SaaS applications like tryholo.ai, Linear, and Stripe.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18+ with TypeScript for type-safe component development
- Vite as the build tool and development server with HMR (Hot Module Replacement)
- Wouter for lightweight client-side routing (instead of React Router)
- Path aliases configured (`@/` for client/src, `@shared/` for shared code, `@assets/` for attached assets)

**UI Component System**
- shadcn/ui component library (New York style variant) with Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Custom CSS variables for theming (light/dark mode support via HSL color system)
- Framer Motion for animations in interactive components
- Component architecture: Modular section-based components (HeroSection, FeaturesAnimated, etc.)

**State Management & Data Fetching**
- TanStack Query (React Query) for server state management
- Custom query client with specific error handling and fetch configurations
- No global client state management - relying on React Query and local component state

**Design System**
- Extreme minimalism with generous white space
- Inter font family (Google Fonts) with weight variations
- Custom spacing scale based on Tailwind's spacing units (4, 8, 12, 16, 20, 24, 32)
- Hover/active elevation system using CSS custom properties (`--elevate-1`, `--elevate-2`)
- Responsive breakpoints: mobile-first approach with lg breakpoint emphasis

### Backend Architecture

**Server Framework**
- Express.js as the HTTP server
- TypeScript with ES modules (`"type": "module"`)
- Custom middleware for request logging with timing and JSON response capture
- Modular route registration pattern via `registerRoutes` function

**Development & Production Setup**
- Development: Vite middleware integrated into Express for HMR
- Production: Pre-built static assets served from `dist/public`
- esbuild for server-side bundling in production builds
- tsx for TypeScript execution in development

**Storage Layer**
- Abstract storage interface (`IStorage`) for CRUD operations
- In-memory storage implementation (`MemStorage`) as default
- Designed to be swappable with database-backed implementations
- Current schema includes basic user model (id, username, password)

**Server-Side Rendering Approach**
- Custom SSR setup using Vite's transformIndexHtml for development
- SPA (Single Page Application) architecture - client-side rendering primary approach
- Express serves the built React application

### External Dependencies

**Database & ORM**
- Drizzle ORM configured for PostgreSQL dialect
- @neondatabase/serverless driver for database connections
- Schema defined in `shared/schema.ts` for code sharing between client/server
- Drizzle Kit for migrations (output to `./migrations` directory)
- Zod schemas generated from Drizzle for runtime validation

**UI Libraries**
- Comprehensive Radix UI component collection (accordion, dialog, dropdown, popover, etc.)
- embla-carousel-react for carousel functionality
- lucide-react for icon system
- cmdk for command palette patterns
- react-day-picker for calendar/date picking

**Form Management**
- React Hook Form with @hookform/resolvers for form handling
- Zod integration for schema-based validation

**Utility Libraries**
- class-variance-authority (cva) for component variant management
- clsx and tailwind-merge for className composition
- date-fns for date manipulation
- nanoid for unique ID generation

**Development Tools**
- @replit/vite-plugin-runtime-error-modal for error overlays
- @replit/vite-plugin-cartographer for Replit integration
- @replit/vite-plugin-dev-banner for development indicators
- PostCSS with Tailwind CSS and Autoprefixer

**Session Management (Prepared)**
- connect-pg-simple for PostgreSQL-based session storage (installed but not actively used in current implementation)

**Build & Type System**
- TypeScript with strict mode enabled
- Path resolution configured for both tsconfig and Vite
- Incremental compilation with build info caching