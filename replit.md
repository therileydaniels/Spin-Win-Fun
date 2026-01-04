# Rigged Wheel Spinner

## Overview

A customizable prize wheel spinner application that appears fair but allows operators to secretly weight outcomes. The app features a polished, premium UI with colorful wheel segments, spin animations, celebration effects (confetti), and sound feedback. Target users include content creators, marketers, teachers, and event hosts who need controlled randomization for giveaways, games, and promotions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, React hooks for local state
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **UI Components**: shadcn/ui component library (Radix UI primitives with custom styling)
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Pattern**: RESTful endpoints prefixed with `/api`
- **Development**: Vite middleware for HMR during development
- **Production**: Static file serving from built assets

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Current Storage**: In-memory storage class (`MemStorage`) for development
- **Database Ready**: PostgreSQL configuration exists via `DATABASE_URL` environment variable

### Key Design Patterns
- **Monorepo Structure**: Client (`client/`), server (`server/`), and shared (`shared/`) directories
- **Path Aliases**: `@/` for client source, `@shared/` for shared code
- **Component Organization**: UI primitives in `components/ui/`, feature components at `components/` root
- **Custom Hooks**: Separated into `hooks/` directory for reusable logic (wheel spin, sound, toast)

### Wheel Spin Logic
- Client-side winner determination with probability-based selection
- Smooth CSS animations with configurable duration (4-5 seconds with variance)
- Celebration effects using canvas-confetti library
- Audio feedback for win events

## External Dependencies

### Third-Party Services
- **Fonts**: Google Fonts (loaded via CDN in index.html)
- **Sound Effects**: Mixkit audio assets (external CDN URL)

### Key NPM Packages
- **UI Framework**: Radix UI primitives (@radix-ui/react-*)
- **Animation**: canvas-confetti for celebration effects
- **Forms**: react-hook-form with zod validation
- **Database**: drizzle-orm, pg (PostgreSQL client)
- **Session**: express-session with connect-pg-simple for persistence

### Development Tools
- **Replit Plugins**: vite-plugin-runtime-error-modal, vite-plugin-cartographer, vite-plugin-dev-banner
- **Build**: esbuild for server bundling, Vite for client