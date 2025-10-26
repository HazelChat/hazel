# Effect RPC Migration Guide

This document explains how we're migrating from `@effect/platform` HttpApi to `@effect/rpc` for our backend API.

## Table of Contents

1. [Why RPC?](#why-rpc)
2. [How Effect RPC Works](#how-effect-rpc-works)
3. [Architecture Overview](#architecture-overview)
4. [Migration Strategy](#migration-strategy)
5. [Code Examples](#code-examples)
6. [Best Practices](#best-practices)
7. [Migration Progress](#migration-progress)

## Why RPC?

We're migrating from HttpApi to RPC for several key benefits:

### 1. **Simpler API Definitions**
- No HTTP verbs, paths, or status codes to manage
- Less boilerplate code
- More declarative API definitions

**Before (HttpApi):**
```typescript
HttpApiEndpoint.post("create", "/")
  .setPayload(Message.Insert)
  .addSuccess(MessageResponse)
  .addError(MessageNotFoundError)
  .addError(UnauthorizedError)
  .addError(InternalServerError)
  .prefix("/messages")
  .middleware(CurrentUser.Authorization)
```

**After (RPC):**
```typescript
Rpc.make("MessageCreate", {
  payload: Message.Insert,
  success: MessageResponse,
  error: Schema.Union(MessageNotFoundError, UnauthorizedError, InternalServerError)
}).middleware(AuthMiddleware)
```

### 2. **Better Developer Experience**
- More idiomatic Effect-TS patterns
- Cleaner middleware system (context providers)
- Automatic client generation
- Better TypeScript inference

### 3. **Protocol Flexibility**
- Same RPC definitions work over HTTP, WebSocket, Workers, etc.
- Easy to add real-time features later
- Future-proof architecture

## How Effect RPC Works

Effect RPC is a type-safe Remote Procedure Call system built on Effect-TS. Here's how it works:

### Core Concepts

1. **RPC Definition** - Define your remote procedures using schemas
2. **RPC Groups** - Organize related RPCs together
3. **RPC Server** - Implement handlers for your RPCs
4. **RPC Client** - Auto-generated type-safe client
5. **RPC Middleware** - Provide context (like current user) to handlers

### Request Flow

```
Client                    Server
  |                          |
  | 1. RPC Call             |
  |  MessageCreate({...})   |
  |------------------------>|
  |                         | 2. Middleware runs
  |                         |    (Auth, logging, etc.)
  |                         |
  |                         | 3. Handler executes
  |                         |    with context
  |                         |
  | 4. Response             |
  |<------------------------|
  |   { data, txid }        |
```

### Message Format

RPC uses a standardized message format:

```typescript
// Request
{
  tag: "MessageCreate",      // RPC method name
  id: "abc-123",             // Request ID
  payload: { ... },          // Request data
  headers: { ... },          // HTTP headers
  tracing: { ... }           // Tracing info
}

// Response (Success)
{
  id: "abc-123",
  exit: { _tag: "Success", value: { data, txid } }
}

// Response (Error)
{
  id: "abc-123",
  exit: { _tag: "Failure", cause: { ... } }
}
```

## Architecture Overview

### Backend Structure

```
apps/backend/src/
├── rpc/
│   ├── server.ts              # RPC server setup
│   ├── middleware/
│   │   └── auth.ts            # Auth middleware (provides CurrentUser)
│   ├── groups/
│   │   ├── messages.ts        # Message RPC definitions
│   │   ├── channels.ts        # Channel RPC definitions
│   │   └── ...                # Other RPC groups
│   └── handlers/
│       ├── messages.ts        # Message RPC implementations
│       ├── channels.ts        # Channel RPC implementations
│       └── ...                # Other handlers
├── api.ts                     # HttpApi (legacy, will be removed)
├── http.ts                    # HttpApi routes (legacy)
└── index.ts                   # Main server (runs both HttpApi and RPC)
```

### Frontend Structure

```
apps/web/src/lib/services/common/
├── api-client.ts              # HttpApi client (legacy)
├── atom-client.ts             # HttpApi + Effect-Atom (legacy)
├── rpc-client.ts              # RPC client (new)
└── rpc-atom-client.ts         # RPC + Effect-Atom (new)
```

### Parallel Operation

During migration, both systems run simultaneously:

- **HttpApi**: `/api/*` routes (existing)
- **RPC**: `/rpc` route (new)

This allows incremental migration with zero downtime.

## Migration Strategy

### Phase 1: Infrastructure Setup ✅

1. Create RPC server infrastructure
2. Create RPC client infrastructure
3. Set up authentication middleware
4. Migrate messaging endpoints as proof-of-concept

### Phase 2: Incremental Migration (In Progress)

Migrate endpoints in batches:

1. **Simple CRUD** - users, organizations, org members
2. **Core Features** - channels, messages, notifications
3. **Special Cases** - file uploads, webhooks, auth flow

### Phase 3: Cleanup (Future)

1. Remove HttpApi infrastructure
2. Delete legacy route files
3. Update all frontend code to use RPC
4. Remove `/api/*` routes

## Code Examples

### Example 1: Simple RPC (Messages)

#### Backend: RPC Definition

**File:** `apps/backend/src/rpc/groups/messages.ts`

```typescript
import { Rpc, RpcGroup } from "@effect/rpc"
import { Message } from "@hazel/db/models"
import { MessageId } from "@hazel/db/schema"
import { Schema } from "effect"
import { TransactionId } from "../../lib/schema"
import { AuthMiddleware } from "../middleware/auth"

// Response schemas
export class MessageResponse extends Schema.Class<MessageResponse>("MessageResponse")({
    data: Message.Model.json,
    transactionId: TransactionId,
}) {}

export class MessageNotFoundError extends Schema.TaggedError<MessageNotFoundError>()(
    "MessageNotFoundError",
    { messageId: Schema.UUID }
) {}

// RPC definitions
export class MessageRpcs extends RpcGroup.make(
    Rpc.make("MessageCreate", {
        payload: Message.Insert,
        success: MessageResponse,
        error: Schema.Union(MessageNotFoundError, InternalServerError)
    }).middleware(AuthMiddleware),

    Rpc.make("MessageUpdate", {
        payload: Schema.Struct({
            id: MessageId,
            ...Message.Model.jsonUpdate.fields
        }),
        success: MessageResponse,
        error: Schema.Union(MessageNotFoundError, InternalServerError)
    }).middleware(AuthMiddleware),

    Rpc.make("MessageDelete", {
        payload: Schema.Struct({ id: MessageId }),
        success: Schema.Struct({ transactionId: TransactionId }),
        error: Schema.Union(MessageNotFoundError, InternalServerError)
    }).middleware(AuthMiddleware)
) {}
```

#### Backend: RPC Handler

**File:** `apps/backend/src/rpc/handlers/messages.ts`

```typescript
import { Database } from "@hazel/db"
import { CurrentUser, policyUse, withRemapDbErrors, withSystemActor } from "@hazel/effect-lib"
import { Effect, Layer } from "effect"
import { generateTransactionId } from "../../lib/create-transactionId"
import { MessagePolicy } from "../../policies/message-policy"
import { MessageRepo } from "../../repositories/message-repo"
import { AttachmentRepo } from "../../repositories/attachment-repo"
import { MessageRpcs } from "../groups/messages"

export const MessageRpcLive = MessageRpcs.toLayer(
    Effect.gen(function* () {
        const db = yield* Database.Database

        return {
            // Handler for MessageCreate
            MessageCreate: ({ attachmentIds, ...messageData }) =>
                db.transaction(
                    Effect.gen(function* () {
                        const user = yield* CurrentUser.Context

                        const createdMessage = yield* MessageRepo.insert({
                            ...messageData,
                            authorId: user.id,
                            deletedAt: null,
                        }).pipe(
                            Effect.map((res) => res[0]!),
                            policyUse(MessagePolicy.canCreate(messageData.channelId))
                        )

                        // Update attachments if provided
                        if (attachmentIds && attachmentIds.length > 0) {
                            yield* Effect.forEach(attachmentIds, (attachmentId) =>
                                AttachmentRepo.update({
                                    id: attachmentId,
                                    messageId: createdMessage.id,
                                }).pipe(withSystemActor)
                            )
                        }

                        const txid = yield* generateTransactionId()

                        return {
                            data: createdMessage,
                            transactionId: txid,
                        }
                    })
                ).pipe(withRemapDbErrors("Message", "create")),

            // Handler for MessageUpdate
            MessageUpdate: ({ id, ...payload }) =>
                db.transaction(
                    Effect.gen(function* () {
                        const updatedMessage = yield* MessageRepo.update({
                            id,
                            ...payload,
                        }).pipe(policyUse(MessagePolicy.canUpdate(id)))

                        const txid = yield* generateTransactionId()

                        return {
                            data: updatedMessage,
                            transactionId: txid,
                        }
                    })
                ).pipe(withRemapDbErrors("Message", "update")),

            // Handler for MessageDelete
            MessageDelete: ({ id }) =>
                db.transaction(
                    Effect.gen(function* () {
                        yield* MessageRepo.deleteById(id).pipe(
                            policyUse(MessagePolicy.canDelete(id))
                        )

                        const txid = yield* generateTransactionId()

                        return { transactionId: txid }
                    })
                ).pipe(withRemapDbErrors("Message", "delete"))
        }
    })
)
```

#### Frontend: RPC Client Usage

**Direct Effect usage:**
```typescript
import { runtime } from "@/lib/services/common/runtime"
import { RpcClient } from "@/lib/services/common/rpc-client"
import { Effect } from "effect"

const { transactionId } = await runtime.runPromise(
    Effect.gen(function* () {
        const client = yield* RpcClient
        return yield* client.MessageCreate({
            channelId: "...",
            content: "Hello world",
            attachmentIds: []
        })
    })
)
```

**React Hook usage:**
```typescript
import { HazelRpcClient } from "@/lib/services/common/rpc-atom-client"
import { useAtomSet } from "effect-atom/react"
import { Exit } from "effect"

function MessageComposer() {
    const createMessage = useAtomSet(
        HazelRpcClient.mutation("MessageCreate"),
        { mode: "promiseExit" }
    )

    const handleSend = async () => {
        const res = await createMessage({
            channelId: "...",
            content: "Hello world",
            attachmentIds: []
        })

        if (Exit.isSuccess(res)) {
            console.log("Message created:", res.value.data.id)
        } else {
            console.error("Failed:", res.cause)
        }
    }

    return <button onClick={handleSend}>Send</button>
}
```

### Example 2: Middleware (Authentication)

**File:** `apps/backend/src/rpc/middleware/auth.ts`

```typescript
import { RpcMiddleware } from "@effect/rpc"
import { CurrentUser } from "@hazel/effect-lib"
import { Effect, Layer } from "effect"
import { extractUserFromCookie } from "../../lib/auth"

// Define middleware that provides CurrentUser
export class AuthMiddleware extends RpcMiddleware.Tag<AuthMiddleware>()(
    "AuthMiddleware",
    {
        provides: CurrentUser,
        requiredForClient: true
    }
) {}

// Server-side implementation
export const AuthMiddlewareLive = Layer.succeed(
    AuthMiddleware,
    AuthMiddleware.of(({ headers, payload, rpc }) =>
        Effect.gen(function* () {
            const cookie = headers["cookie"]

            if (!cookie) {
                return yield* Effect.fail(new UnauthorizedError({
                    message: "No session cookie provided"
                }))
            }

            const user = yield* extractUserFromCookie(cookie)

            return user
        })
    )
)

// Client-side implementation (adds auth headers)
export const AuthMiddlewareClientLive = RpcMiddleware.layerClient(
    AuthMiddleware,
    ({ request, rpc }) =>
        Effect.succeed({
            ...request,
            // No changes needed - browser sends cookies automatically
            // But you could add custom headers here if needed
        })
)
```

### Example 3: Error Handling

RPC errors are type-safe and handled via Effect's error channel:

```typescript
// Backend: Define errors
export class MessageNotFoundError extends Schema.TaggedError<MessageNotFoundError>()(
    "MessageNotFoundError",
    { messageId: Schema.UUID }
) {}

// Backend: Use in RPC definition
Rpc.make("MessageUpdate", {
    error: Schema.Union(
        MessageNotFoundError,
        UnauthorizedError,
        InternalServerError
    )
})

// Frontend: Handle errors
const result = await runtime.runPromise(
    Effect.gen(function* () {
        const client = yield* RpcClient
        return yield* client.MessageUpdate({ id, content })
    }).pipe(
        Effect.catchTag("MessageNotFoundError", (error) =>
            Effect.gen(function* () {
                toast.error(`Message ${error.messageId} not found`)
                return yield* Effect.fail(error)
            })
        ),
        Effect.catchTag("UnauthorizedError", (error) =>
            Effect.gen(function* () {
                toast.error("You don't have permission to edit this message")
                return yield* Effect.fail(error)
            })
        )
    )
)
```

## Best Practices

### 1. **Naming Conventions**

- **RPC Names**: PascalCase with resource + action (e.g., `MessageCreate`, `ChannelDelete`)
- **RPC Groups**: PascalCase with `Rpcs` suffix (e.g., `MessageRpcs`, `ChannelRpcs`)
- **Handlers**: RPC group name + `Live` (e.g., `MessageRpcLive`)

### 2. **Error Handling**

Always define specific error types:

```typescript
// Good: Specific error with context
export class MessageNotFoundError extends Schema.TaggedError<MessageNotFoundError>()(
    "MessageNotFoundError",
    { messageId: Schema.UUID }
) {}

// Bad: Generic error
error: Schema.String
```

### 3. **Payload Design**

Include all required data in the payload (no path parameters):

```typescript
// Good: All data in payload
Rpc.make("MessageUpdate", {
    payload: Schema.Struct({
        id: MessageId,
        content: Schema.String,
        ...
    })
})

// Bad: Separate path and payload
// (This is HttpApi pattern, not RPC)
```

### 4. **Middleware Usage**

Use middleware to provide context, not for business logic:

```typescript
// Good: Middleware provides CurrentUser context
AuthMiddleware.of(({ headers }) =>
    extractUserFromCookie(headers["cookie"])
)

// Then use in handler:
MessageCreate: (payload) =>
    Effect.gen(function* () {
        const user = yield* CurrentUser.Context // From middleware!
        // ...
    })

// Bad: Business logic in middleware
```

### 5. **Transaction Management**

Keep database transactions in handlers, not middleware:

```typescript
// Good:
MessageCreate: (payload) =>
    db.transaction(
        Effect.gen(function* () {
            // Multiple operations in transaction
            const message = yield* MessageRepo.insert(...)
            yield* AttachmentRepo.update(...)
            const txid = yield* generateTransactionId()
            return { data: message, transactionId: txid }
        })
    )
```

## Frontend Usage

### Using RPC from React Components

The frontend provides two ways to use RPC:

#### 1. Via Effect-Atom (Recommended for React)

```typescript
import { HazelRpcClient } from "@/lib/services/common/rpc-atom-client"
import { useAtomSet } from "effect-atom/react"
import { Exit } from "effect"

function MessageComposer({ channelId }: { channelId: string }) {
  const createMessage = useAtomSet(
    HazelRpcClient.mutation("MessageCreate"),
    { mode: "promiseExit" }
  )

  const handleSend = async (content: string) => {
    const result = await createMessage({
      payload: {
        channelId,
        content,
        attachmentIds: []
      },
      reactivityKeys: ["messages", channelId]
    })

    if (Exit.isSuccess(result)) {
      console.log("Message created:", result.value.data.id)
    } else {
      // Handle errors
      if (Cause.isFailure(result.cause)) {
        const error = Cause.failureOption(result.cause)
        if (Option.isSome(error)) {
          if (error.value._tag === "ChannelNotFoundError") {
            toast.error("Channel not found")
          } else if (error.value._tag === "UnauthorizedError") {
            toast.error("You don't have permission")
          }
        }
      }
    }
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      const form = e.currentTarget
      const content = new FormData(form).get("content") as string
      handleSend(content)
    }}>
      <input name="content" placeholder="Type a message..." />
      <button type="submit">Send</button>
    </form>
  )
}
```

#### 2. Via Direct Effect Runtime

```typescript
import { runtime } from "@/lib/services/common/runtime"
import { RpcClient } from "@/lib/services/common/rpc-client"
import { Effect } from "effect"

// In an async function or Effect
const result = await runtime.runPromise(
  Effect.gen(function* () {
    const client = yield* RpcClient

    const message = yield* client.MessageCreate({
      channelId: "...",
      content: "Hello world",
      attachmentIds: []
    })

    return message
  })
)
```

### Migrating Existing Code

To migrate existing HttpApi calls to RPC:

**Before (HttpApi):**
```typescript
const createMessage = useAtomSet(HazelApiClient.mutation("messages", "create"))

await createMessage({
  payload: {
    channelId: "...",
    content: "...",
    attachmentIds: []
  }
})
```

**After (RPC):**
```typescript
const createMessage = useAtomSet(HazelRpcClient.mutation("MessageCreate"))

await createMessage({
  payload: {
    channelId: "...",
    content: "...",
    attachmentIds: []
  }
})
```

**Key differences:**
1. Method names change from `"messages", "create"` to `"MessageCreate"`
2. Everything else stays the same!
3. Type safety is preserved

## Migration Progress

### ✅ Completed

- [x] RPC infrastructure setup (backend + frontend)
- [x] Authentication middleware
- [x] Messaging endpoints migrated to RPC
- [x] Frontend RPC client setup
- [x] Frontend message sending updated to use RPC (`apps/web/src/db/actions.ts`)
- [x] Documentation
- [x] All TypeScript errors resolved

### 🧪 Ready for Testing

The messaging RPC endpoints are fully implemented and ready to test:
- Backend: `/rpc` endpoint serving MessageCreate, MessageUpdate, MessageDelete
- Frontend: `sendMessage` action using RpcClient
- Auth: WorkOS session cookie authentication working via AuthMiddleware

### 📋 Planned

- [ ] Channels endpoints
- [ ] Organizations endpoints
- [ ] Users endpoints

### 📋 Planned

- [ ] Channel members
- [ ] Message reactions
- [ ] Pinned messages
- [ ] Notifications
- [ ] Attachments (file upload)
- [ ] Invitations
- [ ] Organization members
- [ ] Direct message participants
- [ ] Typing indicators
- [ ] Presence
- [ ] Auth flow
- [ ] Webhooks
- [ ] Mock data

### ❌ Not Migrating

These will remain as HttpApi endpoints for now:

- [ ] OAuth callback (requires HTTP redirects)
- [ ] File uploads (multipart form data)

---

## Additional Resources

- [Effect RPC Documentation](https://effect.website/docs/rpc)
- [Effect RPC GitHub](./.context/effect/packages/rpc)
- [Migration Examples](./apps/backend/src/rpc/groups)

## Questions?

If you have questions about the migration, check:

1. This document for patterns and examples
2. The `.context/effect/packages/rpc` directory for library documentation
3. Existing migrated endpoints for reference implementations
