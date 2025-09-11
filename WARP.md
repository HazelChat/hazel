# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a monorepo for "maki-chat" - a modern chat application built with React and Effect-TS. The project uses Bun as the package manager and runtime, with Turbo for monorepo orchestration.

## Architecture

- **Frontend (`apps/web/`)**: React 19 with TypeScript, using TanStack Router for file-based routing, TailwindCSS v4 for styling, and Plate.js for rich text editing
- **Backend (`apps/backendv2/`)**: Bun runtime with Effect-TS for functional programming patterns, providing RPC-style API endpoints
- **Database Package (`packages/db/`)**: Shared Drizzle ORM schemas and models for PostgreSQL, ensuring type safety across frontend and backend

## Common Development Commands

### Root Level Commands
```bash
# Start all applications in development mode
bun run dev

# Build all applications and run typecheck
bun run build

# Run TypeScript typechecking across all packages
bun run typecheck

# Format and lint code using Biome
bun run format:fix

# Run tests in watch mode
bun run test

# Run all tests once
bun run test:once

# Run tests with coverage report
bun run test:coverage

# Debug tests with inspector
bun run test:debug
```

### Frontend Development (`apps/web/`)
```bash
# Start development server on port 3000
cd apps/web && bun run dev

# Build for production
cd apps/web && bun run build

# Run frontend tests
cd apps/web && bun run test
```

### Backend Development (`apps/backendv2/`)
```bash
# Start backend with hot reload
cd apps/backendv2 && bun run dev

# TypeScript checking
cd apps/backendv2 && bun run typecheck
```

### Database Management (`packages/db/`)
```bash
# Run Drizzle Kit commands for schema management
cd packages/db && bun run db
```

## Key Technologies

### Frontend Stack
- **React 19**: Latest React with new features
- **TanStack Router**: File-based routing system (routes in `src/routes/`)
- **TailwindCSS v4**: Utility-first CSS framework with Radix UI themes
- **React Aria Components + Ariakit**: Accessible UI component libraries
- **Plate.js**: Rich text editor with AI integration capabilities
- **TanStack DB + React Form**: Data fetching and form management
- **Cloudflare Realtimekit**: Real-time features
- **WorkOS AuthKit**: Authentication system
- **Vite**: Build tool with React Compiler integration

### Backend Stack
- **Bun Runtime**: Fast JavaScript runtime and package manager
- **Effect-TS**: Functional programming framework for error handling and dependency injection
- **Drizzle ORM**: Type-safe database ORM for PostgreSQL
- **WorkOS Integration**: Authentication and user management

### Development Tools
- **Biome**: All-in-one formatter and linter (replaces ESLint + Prettier)
- **Turborepo**: Monorepo build system and task orchestration
- **Vitest**: Testing framework with React Testing Library
- **TypeScript**: Strict mode enabled across all packages

## Code Style and Formatting

The project uses Biome with the following configuration:
- Tab indentation (4 spaces)
- Double quotes for strings
- Trailing commas
- 110 character line width
- Automatic import organization and sorting
- Arrow functions preferred over function expressions

## Testing

Tests are configured to run across all packages using Vitest. The root `vitest.config.ts` includes projects from `packages/*` and `apps/*`. Coverage reporting includes text, JSON summary, and JSON formats.

## Database Schema

Database schemas are centralized in `packages/db/src/schema/` with corresponding models in `packages/db/src/models/`. Key entities include:
- Users and Organizations
- Channels and Messages
- Attachments and Reactions
- Notifications and Invitations
- Direct Messages and Channel Members

The shared database package ensures type safety between frontend and backend through exported models and schemas.

## Authentication

Uses WorkOS AuthKit for authentication with React integration on the frontend and WorkOS Node SDK on the backend.

## File Structure Conventions

- Frontend routes: File-based routing in `apps/web/src/routes/`
- UI Components: `apps/web/src/components/`
- Database Schemas: `packages/db/src/schema/`
- Database Models: `packages/db/src/models/`
- Backend API: RPC-style endpoints in `apps/backendv2/src/`

## Environment Setup

- Uses Bun v1.2.19 as specified in `packageManager`
- Node version specified in `.node-version`
- AWS CLI is configured (user has AWS access)
- Development environment includes VS Code settings in `.vscode/`
