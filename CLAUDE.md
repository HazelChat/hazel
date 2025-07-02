# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Primary Commands
- `bun dev` - Start all applications in development mode (backend, web, mobile)
- `bun build` - Build and typecheck all apps and packages  
- `bun test` - Run all tests across the monorepo
- `bun test:coverage` - Generate test coverage reports
- `bun format:fix` - Format and fix code issues with Biome

### Application-Specific Commands
- `cd apps/backend && bun run dev` - Start Convex backend only
- `cd apps/web && bun run dev` - Start web app only (port 3000)
- `cd apps/mobile && bun start` - Start Expo mobile app
- `cd apps/backend && bun run setup` - Setup Convex backend (run once)

### Testing Commands
- `bun test:once` - Run tests once without watch mode
- `bun test:debug` - Run tests with debugger support
- Backend tests use `convex-test` with edge-runtime environment

## Architecture Overview

### Monorepo Structure
**Maki Chat** is a Discord-like chat application with three main applications sharing a Convex backend:

- **Backend** (`apps/backend/`): Convex serverless functions with Effect.js integration
- **Web** (`apps/web/`): SolidJS app with TanStack Router and TailwindCSS v4
- **Mobile** (`apps/mobile/`): React Native/Expo app with shared backend

### Tech Stack
- **Package Manager**: Bun with workspaces
- **Build System**: Turborepo for coordinated builds
- **Backend**: Convex with TypeScript, Effect.js, and Confect schema
- **Web Frontend**: SolidJS, TanStack Router/Query, Clerk auth, Ark UI components
- **Mobile**: React Native/Expo, Clerk auth, shared Convex backend
- **Code Quality**: Biome for linting/formatting

### Database Schema
Core entities managed by Convex:
- **Servers**: Chat communities with channels and members
- **Channels**: Public, private, thread, direct message channels  
- **Users**: Server-specific profiles with roles and permissions
- **Messages**: With attachments, reactions, replies, and threading
- **Accounts**: Cross-server user identities
- **Notifications**: User preferences and push notification settings

### Key Patterns
- **Middleware Pattern**: Backend uses middleware for auth and user context
- **Effect.js Integration**: Functional error handling throughout backend
- **Real-time Subscriptions**: Convex handles live data sync across clients
- **File-based Routing**: Both web (TanStack) and mobile (Expo Router)
- **Component Composition**: Reusable UI components with proper TypeScript

## Development Notes

### Backend Development
- Functions in `apps/backend/convex/` are deployed as Convex serverless functions
- Schema defined using Confect with Effect.js integration
- Tests use `convex-test` and should run in edge-runtime environment
- Middleware handles authentication and user context injection

### Frontend Development  
- Web app uses SolidJS with file-based routing via TanStack Router
- Styling with TailwindCSS v4 and custom theme system
- Real-time updates via Convex subscriptions and TanStack Query
- Mobile app shares same backend APIs with platform-appropriate UI

### Testing Strategy
- Backend: Integration tests with convex-test covering functions and schema
- Packages: Unit tests for shared utilities and components
- Run `bun test:coverage` before major changes to ensure coverage

### Common Issues
- Ensure Convex backend is running before starting frontend apps
- Mobile development requires Expo CLI and appropriate simulators/devices
- TypeScript strict mode is enabled - address all type errors before committing