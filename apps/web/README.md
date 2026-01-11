# Hazel Web App

React frontend for Hazel Chat built with Vite, TanStack Router, and TailwindCSS v4.

## Setup

See the [root README](../../README.md) for development setup instructions.

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and builds
- **TanStack Router** with file-based routing (`src/routes/`)
- **TanStack DB** with Electric SQL for local-first real-time sync
- **TailwindCSS v4** for styling
- **React Aria Components** for accessible UI primitives

## Development

Once setup is complete, start all services from the monorepo root:

```bash
bun run dev
```

The web app runs at http://localhost:3000.

## Routing

Routes are file-based in `src/routes/`. TanStack Router automatically generates route types.

## Styling

This project uses TailwindCSS v4 with Radix UI themes. Run `bun run format` to auto-format code.
