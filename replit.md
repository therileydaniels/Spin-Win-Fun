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
- **Storage**: DatabaseStorage class using PostgreSQL
- **Database**: PostgreSQL via `DATABASE_URL` environment variable

### Key Design Patterns
- **Monorepo Structure**: Client (`client/`), server (`server/`), and shared (`shared/`) directories
- **Path Aliases**: `@/` for client source, `@shared/` for shared code
- **Component Organization**: UI primitives in `components/ui/`, feature components at `components/` root
- **Custom Hooks**: Separated into `hooks/` directory for reusable logic (wheel spin, sound, toast)

### Wheel Spin Logic
- **Server-side** winner determination with weighted probability selection (POST /api/spin)
- Probabilities hidden from browser Network tab (only winnerIndex returned)
- Smooth CSS animations with configurable duration (4-5 seconds with variance)
- Rotation calculation accounts for accumulated spins to ensure visual alignment
- Celebration effects using canvas-confetti library
- Audio feedback for win events

### Segment Customization (Phase 3)
- Custom segments stored in localStorage with probabilities
- 2-20 segments supported (add/remove with limits enforced)
- Editable segment names (max 25 characters, auto-scaling text on wheel)
- Color picker with 12 preset gradient colors + custom hex input
- All changes persist across page reloads

### Presentation Mode (Phase 4)
- Toggle via Monitor icon in header to enter clean presentation view
- Hides all controls: header, footer, Wheel Settings panel
- Wheel scales up (600px max) for cinematic audience display
- Exit via Settings button (top-right corner, 40% opacity) or ESC key
- Probabilities never visible to audience during presentation

### User Authentication (Phase 5)
- **Database Tables**: Users (id, email, password, name, role, timestamps) and Wheels (for Phase 6)
- **Sign Up**: Email, password (min 8 chars, 1 letter, 1 number), optional name
- **Sign In**: Email and password with generic error messages
- **Session Management**: 7-day sessions with PostgreSQL storage, rolling expiry
- **Security**: bcrypt (12 rounds), rate limiting (5/min), httpOnly cookies, session regeneration
- **UI**: AuthModal with tabs for Sign In/Sign Up, header shows user status
- **Wheel works without account** - auth only needed to save wheels (Phase 6)

**Admin SQL Command**:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

### Admin Dashboard (Phase 7)
- **Route**: `/admin` - accessible only to users with role = "admin"
- **Stats Overview**: Total users, users by role (free/paid/admin), total wheels, new users this week/month
- **Users Management**: Table with email, name, role, wheel count, join date
- **User Actions**: Role dropdown (free/paid/admin), delete user (with confirmation)
- **Security**: requireAdmin middleware on all `/api/admin/*` endpoints, 403 for non-admins
- **UI**: Shield icon in header (visible only to admins), search/filter users, pagination

**Admin API Endpoints**:
- GET /api/admin/stats - Dashboard statistics
- GET /api/admin/users?page=1&limit=10&search=email - Paginated user list
- PUT /api/admin/users/:id/role - Change user role
- DELETE /api/admin/users/:id - Delete user and their wheels

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
- **Security**: bcrypt for password hashing, express-rate-limit for API protection

### Development Tools
- **Replit Plugins**: vite-plugin-runtime-error-modal, vite-plugin-cartographer, vite-plugin-dev-banner
- **Build**: esbuild for server bundling, Vite for client

## Design System

See `STYLE_GUIDE.md` for detailed documentation on:
- Typography hierarchy (h1: text-xl font-bold, CardTitle: text-lg font-semibold)
- Color tokens and role badge colors (Admin: purple, Paid: blue, Free: gray)
- Border conventions (always use `border-border` for theme adaptation)
- Shadow usage (only on wheel, spin button, winner modal)
- Icon button sizing (always use `size="icon"` for h-9 w-9 dimensions)
- Spacing standards and component patterns