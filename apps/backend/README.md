# Hazel Backend

Effect-TS backend API server for Hazel Chat using Bun runtime.

## Setup

See the [root README](../../README.md) for development setup instructions.

## Tech Stack

- **Bun** runtime
- **Effect-TS** for functional programming and dependency injection
- **Effect RPC** for type-safe APIs
- **Drizzle ORM** with PostgreSQL
- **WorkOS** for authentication

## Development

Once setup is complete, start all services from the monorepo root:

```bash
bun run dev
```

The backend runs at http://localhost:3003.
