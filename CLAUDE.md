# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a monorepo with the following structure:
- `apps/web/` - React frontend using Vite, TanStack Router, and TailwindCSS
- `apps/backendv2/` - Backend API using Bun runtime and Effect-TS
- `packages/db/` - Shared database package using Drizzle ORM and PostgreSQL
- `.context/` - Git Subtrees for context of how to use specific libraries (In this case Effect and Effect Atom)

## Library Documentation (.context/)

**IMPORTANT**: Always check the `.context/` directory for library-specific documentation and example code before implementing features with these libraries.

Available library contexts:
- `.context/effect/` - Effect-TS functional programming patterns and examples
- `.context/effect-atom/` - Effect Atom state management documentation
- `.context/tanstack-db/` - TanStack-DB

When working with Effect, Effect Atom, or TanStack DB, refer to these directories for best practices, API usage, and implementation patterns.

### Best Practices Guides

**Effect Atom**: See `EFFECT_ATOM_BEST_PRACTICES.md` for comprehensive guidance on:
- Creating and managing atoms
- React integration patterns
- Working with Effects and Results
- Integration with localStorage, HttpApi, and TanStack DB
- Performance optimization techniques
- Real-world examples from this codebase

## Development Commands

### Root Level
- `bun run dev` - Start all apps in development mode via Turbo
- `bun run build` - Build all apps and run typecheck
- `bun run typecheck` - Run TypeScript typechecking across all packages
- `bun run format:fix` - Format code using Biome (includes linting and auto-fixes)
- `bun run test` - Run tests in watch mode using Vitest
- `bun run test:once` - Run all tests once
- `bun run test:coverage` - Run tests with coverage report

### Web App (apps/web)
- `bun run dev` - Start Vite dev server on port 3000
- `bun run build` - Build for production and typecheck
- `bun run typecheck` - TypeScript checking without emitting files

### Backend (apps/backendv2)
- `bun run dev` - Start backend with hot reload using Bun
- `bun run typecheck` - TypeScript checking

### Database (packages/db)
- `bun run db` - Run Drizzle Kit commands for schema management

## Tech Stack

### Frontend (Web App)
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Routing**: TanStack Router with file-based routing
- **Styling**: TailwindCSS v4 with Radix UI themes
- **UI Components**: React Aria Components + Ariakit
- **State Management**: TanStack Query + React Form
- **Rich Text**: Plate.js editor with AI features
- **Real-time**: Cloudflare Realtimekit
- **Auth**: WorkOS AuthKit

### Backend
- **Runtime**: Bun
- **Framework**: Effect-TS for functional programming
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: WorkOS integration
- **API**: RPC-style endpoints via Effect Http Api

### Development Tools
- **Package Manager**: Bun with workspaces
- **Monorepo**: Turborepo for task orchestration
- **Linting/Formatting**: Biome (replaces ESLint + Prettier)
- **Testing**: Vitest with React Testing Library
- **TypeScript**: Strict mode enabled across all packages

## Code Style

The project uses Biome for consistent formatting:
- Tab indentation (4 spaces)
- Double quotes for strings
- Trailing commas
- 110 character line width
- Import organization and sorting enabled

Run `bun run format:fix` to apply formatting and fix linting issues automatically.

## Database

Uses Drizzle ORM with PostgreSQL. Database schema is defined in `packages/db/src/schema/`. Use `bun run db` commands for migrations and schema management.

## Architecture Notes

- Frontend uses file-based routing with TanStack Router
- Backend follows Effect-TS patterns for error handling and dependency injection
- Real-time features implemented via Cloudflare Realtimekit
- Authentication handled by WorkOS with React integration
- Shared database package ensures type safety between frontend and backend