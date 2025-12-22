# Hazel Chat

A modern, real-time collaborative chat platform built with Effect-TS, ElectricSQL, TanstackDB, React, and PostgreSQL.

## Overview

Hazel Chat is a full-stack chat application featuring:

- **Effect-TS** for type-safe, functional backend programming
- **Type-safe RPC** for seamless client-server communication
- **Local-first architecture** with Electric SQL for real-time sync
- **Distributed workflows** via Effect Cluster for background jobs

## Features

- **Real-time Messaging** - Channels and direct messages with instant delivery
- **User Presence** - Live online/offline status and typing indicators
- **Message Reactions** - React to messages with emoji
- **Pinned Messages** - Save important messages for quick access
- **File Attachments** - Share files with Cloudflare R2 storage
- **Notifications** - Configurable notification system with muting
- **Team Management** - Organizations with member roles and invitations
- **Rich Text Editor** - Plate.js powered editor with formatting
- **Bot Integration** - Create and manage bots with a simple API

## Tech Stack

### Frontend

- **React 19** with TypeScript
- **Vite** for fast development and builds
- **TanStack Router** with file-based routing
- **TanStack DB**
- **TailwindCSS v4**
- **React Aria Components**
- **Electric SQL** for local-first real-time sync

### Backend

- **Bun** runtime
- **Effect-TS** functional programming framework
- **Effect RPC** for type-safe APIs
- **Drizzle ORM** with PostgreSQL
- **WorkOS** for authentication

### Cluster Service

- **Effect Cluster** for distributed systems
- **Effect Workflow** for durable background jobs
- PostgreSQL-backed persistence

### Development Tools

- **Turborepo** for monorepo orchestration
- **OXC** for linting and formatting
- **Vitest** for testing

## Project Structure

```
├── apps/
│   ├── web/                 # React frontend (port 3000)
│   ├── backend/             # Effect-TS API server (port 3003)
│   ├── cluster/             # Distributed workflow service (port 3020)
│   ├── electric-proxy/      # Electric SQL proxy worker
│   └── link-preview-worker/ # Link preview generation
├── packages/
│   ├── db/                  # Drizzle ORM schemas and migrations
│   ├── domain/              # Shared types, RPC contracts, cluster definitions
│   ├── backend-core/        # Reusable backend services and repositories
│   ├── schema/              # Shared schema definitions
│   └── ...
└── .context/                # Library documentation (Effect, Effect Atom, TanStack DB)
```

## Prerequisites

- [Bun](https://bun.sh/) (latest version)
- [Node.js](https://nodejs.org/) 22+
- [WorkOS](https://workos.com/) account (for authentication)

## Getting Started

1. **Clone the repository**

    ```bash
    git clone <repository-url>
    cd app
    ```

2. **Install dependencies**

    ```bash
    bun install
    ```

3. **Set up environment variables**

    Create `.env` files in the relevant apps. Key variables include:

    **apps/web/.env**

    ```
    VITE_BACKEND_URL=http://localhost:3003
    VITE_CLUSTER_URL=http://localhost:3020
    VITE_WORKOS_CLIENT_ID=<your-workos-client-id>
    VITE_WORKOS_REDIRECT_URI=http://localhost:3000/callback
    VITE_ELECTRIC_URL=<electric-sql-url>
    ```

    **apps/backend/.env**

    ```
    DATABASE_URL=postgresql://user:password@localhost:5432/maki_chat
    WORKOS_API_KEY=<your-workos-api-key>
    WORKOS_COOKIE_PASSWORD=<32-character-secret>
    ```

    **apps/cluster/.env**

    ```
    DATABASE_URL=postgresql://user:password@localhost:5432/maki_chat
    ```

4. **Run database migrations**

    ```bash
    cd packages/db
    bun run db push
    ```

5. **Start development**

    ```bash
    bun run dev
    ```

    This starts all apps via Turborepo:
    - Web: http://localhost:3000
    - Backend: http://localhost:3003
    - Cluster: http://localhost:3020

## Development Commands

| Command                 | Description                                 |
| ----------------------- | ------------------------------------------- |
| `bun run dev`           | Start all apps in development mode          |
| `bun run build`         | Build all apps and packages                 |
| `bun run typecheck`     | Run TypeScript checking across all packages |
| `bun run format`        | Format and lint code with OXC               |
| `bun run test`          | Run tests in watch mode                     |
| `bun run test:once`     | Run all tests once                          |
| `bun run test:coverage` | Run tests with coverage report              |

## Architecture

### Effect-TS Patterns

The backend uses Effect-TS for:

- **Dependency injection** via layers and services
- **Error handling** with typed errors
- **Resource management** with scoped resources
- **Concurrency** with fibers and streams

### RPC System

Type-safe client-server communication using Effect RPC:

- Contracts defined in `packages/domain`
- Full type inference across the boundary
- Automatic serialization/deserialization

### Real-time Sync

Electric SQL provides local-first data synchronization:

- Optimistic updates with automatic conflict resolution
- Offline support with background sync
- Reactive queries via TanStack Query integration

### Workflow System

Effect Cluster handles background jobs:

- Durable workflow execution
- Automatic retries and failure handling
- PostgreSQL-backed persistence

## Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Detailed architecture and development guidelines
- **[packages/db/README.md](./packages/db/README.md)** - Database schema documentation
- **[.context/](./.context/)** - Library-specific guides for Effect, Effect Atom, and TanStack DB

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run formatting (`bun run format:fix`)
5. Run tests (`bun run test:once`)
6. Commit your changes
7. Push to your branch
8. Open a Pull Request

### Code Style

This project uses [OXC](https://oxc.rs/) for formatting and linting:

- Tab indentation
- Double quotes
- Trailing commas
- 110 character line width

Run `bun run format` before committing.

## License

See [LICENSE](./LICENSE) for details.
