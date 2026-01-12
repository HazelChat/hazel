# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a monorepo with the following structure:

- `apps/web/` - React frontend using Vite, TanStack Router, and TailwindCSS
- `apps/backendv2/` - Backend API using Bun runtime and Effect-TS
- `apps/cluster/` - Effect Cluster service for distributed workflows and background jobs
- `packages/db/` - Shared database package using Drizzle ORM and PostgreSQL
- `packages/domain/` - Shared domain types, RPC contracts, and cluster definitions
- `.context/` - Git Subtrees for context of how to use specific libraries (In this case Effect and Effect Atom)

<!-- opensrc:start -->

## Source Code Reference

Source code for dependencies is available in `opensrc/` for deeper understanding of implementation details.

See `opensrc/sources.json` for the list of available packages and their versions.

Use this source code when you need to understand how a package works internally, not just its types/interface.

### Fetching Additional Source Code

To fetch source code for a package or repository you need to understand, run:

```bash
npx opensrc <package>           # npm package (e.g., npx opensrc zod)
npx opensrc pypi:<package>      # Python package (e.g., npx opensrc pypi:requests)
npx opensrc crates:<package>    # Rust crate (e.g., npx opensrc crates:serde)
npx opensrc <owner>/<repo>      # GitHub repo (e.g., npx opensrc vercel/ai)
```

<!-- opensrc:end -->

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

**CRITICAL**: NEVER start the dev server - it should already be running! Do not run `bun run dev`, `PORT=3000 bun run dev`, or any variant of starting the dev server.

### Root Level

- `bun run dev` - Start all apps in development mode via Turbo (DO NOT USE - already running)
- `bun run build` - Build all apps and run typecheck
- `bun run typecheck` - Run TypeScript typechecking across all packages
- `bun run format` - Format code using Oxc (includes linting and auto-fixes)
- `bun run test` - Run tests in watch mode using Vitest
- `bun run test:once` - Run all tests once
- `bun run test:coverage` - Run tests with coverage report

### Web App (apps/web)

- `bun run dev` - Start Vite dev server on port 3000 (DO NOT USE - already running)
- `bun run build` - Build for production and typecheck
- `bun run typecheck` - TypeScript checking without emitting files

### Backend (apps/backendv2)

- `bun run dev` - Start backend with hot reload using Bun (DO NOT USE - already running)
- `bun run typecheck` - TypeScript checking

### Cluster (apps/cluster)

- `bun run dev` - Start cluster service with hot reload on port 3020 (DO NOT USE - already running)
- `bun run start` - Start cluster service in production mode
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

### Cluster Service

- **Runtime**: Bun
- **Framework**: Effect Cluster + Effect Workflow
- **Purpose**: Distributed workflows and background jobs
- **Storage**: PostgreSQL-backed message persistence
- **Communication**: BunClusterSocket for shard coordination
- **API**: HTTP endpoints for workflow management (port 3020)

### Development Tools

- **Package Manager**: Bun with workspaces
- **Monorepo**: Turborepo for task orchestration
- **Linting/Formatting**: OXC (replaces ESLint + Prettier)
- **Testing**: Vitest with React Testing Library
- **TypeScript**: Strict mode enabled across all packages

## Code Style

The project uses OXC for consistent formatting:

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
- Domain package (`packages/domain/`) contains shared contracts:
    - RPC definitions for client-server communication
    - HTTP API definitions
    - Cluster entity and workflow definitions (importable by both frontend and cluster service)
    - Shared error types and data models

## Effect-TS Best Practices

### Always Use `Effect.Service` Instead of `Context.Tag`

**ALWAYS** prefer `Effect.Service` over `Context.Tag` for defining services. Effect.Service provides built-in `Default` layer, automatic accessors, and proper dependency declaration.

```typescript
// ✅ CORRECT - Use Effect.Service
export class MyService extends Effect.Service<MyService>()("MyService", {
    accessors: true,
    effect: Effect.gen(function* () {
        // ... implementation
        return { /* methods */ }
    }),
}) {}

// Usage: MyService.Default, yield* MyService
```

```typescript
// ❌ WRONG - Don't use Context.Tag for services
export class MyService extends Context.Tag("MyService")<
    MyService,
    { /* shape */ }
>() {
    static Default = Layer.effect(this, Effect.gen(function* () { /* ... */ }))
}
```

**When Context.Tag is acceptable:**

- Infrastructure layers with runtime injection (e.g., Cloudflare KV namespace, worker bindings)
- Factory patterns where the resource is provided externally at runtime

### Use `dependencies` Array in Effect.Service

**ALWAYS** declare service dependencies in the `dependencies` array when using `Effect.Service`. This ensures proper layer composition and avoids "leaked dependencies" that require manual `Layer.provide` calls at the usage site.

```typescript
// ✅ CORRECT - Dependencies declared in the service
export class MyService extends Effect.Service<MyService>()("MyService", {
    accessors: true,
    dependencies: [DatabaseService.Default, CacheService.Default],
    effect: Effect.gen(function* () {
        const db = yield* DatabaseService
        const cache = yield* CacheService
        // ... implementation
    }),
}) {}

// Usage is simple - MyService.Default includes all dependencies
const MainLive = Layer.mergeAll(MyService.Default, OtherService.Default)
```

```typescript
// ❌ WRONG - Dependencies leaked to usage site
export class MyService extends Effect.Service<MyService>()("MyService", {
    accessors: true,
    effect: Effect.gen(function* () {
        const db = yield* DatabaseService
        const cache = yield* CacheService
        // ... implementation
    }),
}) {}

// Now every usage site must manually wire dependencies
const MainLive = Layer.mergeAll(
    MyService.Default.pipe(
        Layer.provide(DatabaseService.Default),
        Layer.provide(CacheService.Default),
    ),
    OtherService.Default,
)
```

**When it's acceptable to omit dependencies:**

- Infrastructure layers that are globally provided (e.g., Redis, Database) may be intentionally "leaked" to be provided once at the application root
- When a dependency is explicitly meant to be provided by the consumer

## Brand Icons

Use Brandfetch CDN for integration brand logos/icons. See `apps/web/src/routes/_app/$orgSlug/settings/integrations/_data.ts` for the helper function.

**URL Pattern**: `https://cdn.brandfetch.io/{domain}/w/{size}/h/{size}/theme/{theme}/{type}`

- `domain`: The company's domain (e.g., `linear.app`, `github.com`, `figma.com`)
- `size`: Image dimensions in pixels (e.g., 64, 512)
- `theme`: `light` or `dark`
- `type`: `icon` (small inline logos) or `symbol` (larger brand marks)

**Example**:

```typescript
// For small inline icons, use type="icon"
<img src="https://cdn.brandfetch.io/linear.app/w/64/h/64/theme/dark/icon" alt="Linear" className="size-4" />
```

## Effect Cluster Architecture

The cluster service provides durable, distributed workflow execution:

### Domain Pattern for Cluster

**Definitions (packages/domain/src/cluster/):**

- `entities/` - Entity RPC definitions (client-importable)
- `workflows/` - Workflow type definitions
- `activities/` - Activity payload/result schemas
- `errors.ts` - Cluster-specific error types

**Implementations (apps/cluster/src/):**

- `entities/` - Entity handler implementations
- `workflows/` - Workflow handler implementations
- `index.ts` - Cluster server setup and HTTP API

### Available Workflows

**MessageNotificationWorkflow**: Creates notifications for new messages

- Triggered when a message is created in a channel
- Queries channel members with notifications enabled (`isMuted = false`)
- Excludes the message author from notifications
- Creates notification entries in the `notifications` table
- Increments `notificationCount` for each notified member
- Uses idempotency key (messageId) to process each message only once
- Activities:
    - **GetChannelMembers**: Queries eligible members from `channel_members` table
    - **CreateNotifications**: Batch creates notifications and updates counters

### Workflow Execution

Workflows can be triggered via HTTP API:

```bash
POST http://localhost:3020/workflows/MessageNotificationWorkflow/execute
{
  "id": "msg-uuid-123",
  "messageId": "msg-uuid-123",
  "channelId": "channel-uuid-456",
  "authorId": "user-uuid-789"
}
```

Or from backend code (typically in message creation handler):

```typescript
import { WorkflowClient } from "@hazel/cluster"

// After creating a message, trigger the notification workflow
yield* WorkflowClient.pipe(
  Effect.flatMap(client =>
    client.workflows.MessageNotificationWorkflow.execute({
      id: message.id,           // Execution ID (use message ID for idempotency)
      messageId: message.id,
      channelId: message.channelId,
      authorId: message.authorId
    })
  )
)
```

### Adding New Workflows

1. **Define in domain** (`packages/domain/src/cluster/workflows/`):

    ```typescript
    import { Workflow } from "@effect/cluster"
    import { Schema } from "effect"

    export const MyWorkflow = Workflow.make({
      name: "MyWorkflow",
      payload: {
        id: Schema.String,
        // ... other payload fields
      },
      idempotencyKey: ({ id }) => id
    })
    ```

2. **Define activity schemas** (`packages/domain/src/cluster/activities/`):

    ```typescript
    export const MyActivityResult = Schema.Struct({
      resultField: Schema.String,
    })

    export class MyActivityError extends Schema.TaggedError<MyActivityError>()(
      "MyActivityError",
      {
        message: Schema.String,
      }
    ) {}
    ```

3. **Implement in cluster** (`apps/cluster/src/workflows/`):

    ```typescript
    import { Activity } from "@effect/workflow"
    import { Cluster } from "@hazel/domain"
    import { Effect } from "effect"

    export const MyWorkflowLayer = Cluster.MyWorkflow.toLayer(
      Effect.fn(function*(payload) {
        // Use activities with proper schemas
        const result = yield* Activity.make({
          name: "MyActivity",
          success: Cluster.MyActivityResult,  // REQUIRED
          error: Cluster.MyActivityError,     // REQUIRED
          execute: Effect.gen(function*() {
            // Activity implementation
            return { resultField: "value" }
          })
        })

        // Use result (properly typed)
        yield* Effect.log(result.resultField)
      })
    )
    ```

4. **Register** in `apps/cluster/src/index.ts`:

    ```typescript
    import { MyWorkflowLayer } from "./workflows/index.ts"

    const workflows = [Cluster.MyWorkflow, ...] as const
    const AllWorkflows = Layer.mergeAll(MyWorkflowLayer, ...)
    ```

### Important Workflow Patterns

**Always include success/error schemas in Activity.make**:

```typescript
// ❌ WRONG - Missing schemas
yield* Activity.make({
  name: "SendEmail",
  execute: Effect.gen(...)
})

// ✅ CORRECT - Includes schemas
yield* Activity.make({
  name: "SendEmail",
  success: EmailSentResult,
  error: EmailSendError,
  execute: Effect.gen(...)
})
```

**Database access in workflows**:

```typescript
import { PgClient } from "@effect/sql-pg"

yield* Activity.make({
  name: "QueryDatabase",
  success: QueryResult,
  error: DatabaseError,
  execute: Effect.gen(function*() {
    const sql = yield* PgClient.PgClient
    const rows = yield* sql`SELECT * FROM table WHERE id = ${id}`.pipe(Effect.orDie)
    return rows
  })
})
```
