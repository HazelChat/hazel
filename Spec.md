# Bot SDK v2 Specification

## Overview

A TypeScript-first bot SDK built with Rivet Actors for building bots that respond to database events and slash commands. Uses Electric SQL for real-time event streaming and Rivet for lightweight, scalable actor-based bot runtime.

## Design Goals

1. **Rivet Actors foundation** - Stateful, hibernatable actors with automatic persistence
2. **Electric SQL integration** - Real-time event streaming via shape subscriptions
3. **Declarative commands** - Define command schemas for auto-generated UI
4. **Lightweight runtime** - Actors sleep when idle, zero cold starts
5. **Scalable architecture** - Per org+bot actor isolation

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Frontend (apps/web)                                │
│  ┌────────────────┐     ┌────────────────┐     ┌────────────────────────┐   │
│  │ Command        │     │ Bot Install    │     │ Static Command         │   │
│  │ Autocomplete   │     │ UI (Settings)  │     │ Definitions (shared)   │   │
│  └───────┬────────┘     └───────┬────────┘     └────────────────────────┘   │
│          │                      │                                            │
└──────────┼──────────────────────┼────────────────────────────────────────────┘
           │                      │
           ▼                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Backend (apps/backendv2)                             │
│  ┌────────────────┐     ┌────────────────┐     ┌────────────────────────┐   │
│  │ Bot Command    │────►│ Request        │────►│ Bot Actor Proxy        │   │
│  │ HTTP Endpoint  │     │ Validator      │     │ (forwards to Rivet)    │   │
│  └────────────────┘     └────────────────┘     └───────────┬────────────┘   │
│                                                             │                │
│  ┌────────────────┐     ┌────────────────┐                 │                │
│  │ Bot Install    │     │ Message RPC    │◄────────────────┘                │
│  │ Endpoints      │     │ Endpoints      │  (bot creates messages via RPC)  │
│  └────────────────┘     └────────────────┘                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Bot Actors (apps/bots)                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     Rivet Actor Registry                             │    │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────────────┐    │    │
│  │  │ ReminderBot   │  │ LinearBot     │  │ Future Bots...        │    │    │
│  │  │ Actor         │  │ Actor         │  │                       │    │    │
│  │  │               │  │               │  │                       │    │    │
│  │  │ state:        │  │ state:        │  │                       │    │    │
│  │  │ - reminders[] │  │ - config      │  │                       │    │    │
│  │  │               │  │               │  │                       │    │    │
│  │  │ actions:      │  │ actions:      │  │                       │    │    │
│  │  │ - remind      │  │ - issue       │  │                       │    │    │
│  │  │ - reminders   │  │               │  │                       │    │    │
│  │  └───────┬───────┘  └───────┬───────┘  └───────────────────────┘    │    │
│  │          │                  │                                        │    │
│  │          │    Electric SQL Shape Subscriptions                       │    │
│  │          │    (messages WHERE org_id = ?)                            │    │
│  │          ▼                  ▼                                        │    │
│  │  ┌─────────────────────────────────────────────────────────────┐    │    │
│  │  │              onMessage Handler (messages.insert)             │    │    │
│  │  └─────────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                            ┌───────────────┐
                            │  PostgreSQL   │
                            │  + Electric   │
                            └───────────────┘
```

### Components

| Component | Purpose |
|-----------|---------|
| **Rivet Actor Registry** | Manages bot actor lifecycle, hibernation, and state persistence |
| **Bot Actors** | Per org+bot instances that handle commands and events |
| **Electric Subscriber** | Each actor subscribes to Electric SQL for real-time message events |
| **Backend Proxy** | Routes command requests from frontend to appropriate bot actor |
| **Message RPC** | Bot actors call backend to create response messages |

### Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Actor granularity | Per bot+org | Isolates org data, scales with orgs, maintains per-tenant state |
| Event delivery | Bot actors subscribe directly to Electric | Decentralized, simpler routing |
| Persistent state | Minimal config + scheduled tasks | Reminders stored in actor state, no DB table needed |
| Command execution | Frontend → Backend → Actor | Backend validates auth, then forwards to actor |
| Bot responses | Actor calls backend RPC | Reuses existing message creation logic |
| Scheduling | Rivet c.schedule | Native actor scheduling, survives hibernation |
| Context model | Pure Rivet context (c) | Simpler, no Effect bridging needed |

---

## Bot Definition

### Command Schema (packages/bots/src/commands.ts)

```typescript
export interface BotCommandArgument {
  name: string
  type: "string" | "number" | "user" | "channel"
  required: boolean
  placeholder?: string
  description?: string
}

export interface BotCommand {
  name: string
  description: string
  arguments: BotCommandArgument[]
  usageExample?: string
}

export interface BotDefinition {
  id: string
  name: string
  displayName: string
  description: string
  avatar?: string
  commands: BotCommand[]
}

// Reminder bot definition
export const REMINDER_BOT: BotDefinition = {
  id: "reminder-bot",
  name: "reminder",
  displayName: "Reminder Bot",
  description: "Set reminders that notify you later",
  commands: [
    {
      name: "remind",
      description: "Set a reminder",
      arguments: [
        { name: "time", type: "string", required: true, placeholder: "e.g., 5m, 1h, 2d" },
        { name: "message", type: "string", required: true, placeholder: "What to remind you about" },
      ],
    },
    {
      name: "reminders",
      description: "List your active reminders",
      arguments: [],
    },
  ],
}

export const ALL_BOTS = [REMINDER_BOT] as const
```

### Bot Actor (packages/bots/src/actors/reminder-bot.ts)

```typescript
import { actor } from "rivetkit"
import { Duration } from "effect"

interface Reminder {
  id: string
  userId: string
  channelId: string
  message: string
  dueAt: number
  createdAt: number
}

export const reminderBot = actor({
  // Initialize state per org
  createState: (c, input: { orgId: string }) => ({
    orgId: input.orgId,
    reminders: [] as Reminder[],
  }),

  // Ephemeral vars (not persisted)
  vars: {
    electricSubscription: null as any,
  },

  // Called when actor wakes from hibernation
  onWake: (c) => {
    // Subscribe to Electric for new messages
    // c.vars.electricSubscription = subscribeToMessages(c.state.orgId)

    // Reschedule any pending reminders
    for (const reminder of c.state.reminders) {
      if (reminder.dueAt > Date.now()) {
        c.schedule.at(reminder.dueAt, "fireReminder", { reminderId: reminder.id })
      }
    }
  },

  actions: {
    // Create a reminder
    remind: async (c, args: {
      userId: string
      channelId: string
      time: string
      message: string
    }) => {
      const duration = parseReminderTime(args.time)
      if (!duration) {
        return { success: false, error: "Invalid time format. Use: 5m, 1h, 2d" }
      }

      const dueAt = Date.now() + Duration.toMillis(duration)
      const reminder: Reminder = {
        id: crypto.randomUUID(),
        userId: args.userId,
        channelId: args.channelId,
        message: args.message,
        dueAt,
        createdAt: Date.now(),
      }

      c.state.reminders.push(reminder)
      c.schedule.at(dueAt, "fireReminder", { reminderId: reminder.id })

      return {
        success: true,
        reminderId: reminder.id,
        responseMessage: `Got it! I'll remind you in ${args.time}.`,
      }
    },

    // List user's reminders
    reminders: (c, args: { userId: string }) => {
      const pending = c.state.reminders.filter(
        r => r.userId === args.userId && r.dueAt > Date.now()
      )
      return { reminders: pending }
    },

    // Cancel a reminder
    cancelReminder: (c, args: { reminderId: string; userId: string }) => {
      const idx = c.state.reminders.findIndex(
        r => r.id === args.reminderId && r.userId === args.userId
      )
      if (idx === -1) return { success: false, error: "Reminder not found" }
      c.state.reminders.splice(idx, 1)
      return { success: true }
    },

    // Scheduled action - fires when reminder is due
    fireReminder: async (c, args: { reminderId: string }) => {
      const reminder = c.state.reminders.find(r => r.id === args.reminderId)
      if (!reminder) return

      // Remove from state
      c.state.reminders = c.state.reminders.filter(r => r.id !== args.reminderId)

      // Call backend RPC to send DM to user
      await sendReminderDM({
        orgId: c.state.orgId,
        userId: reminder.userId,
        message: `Reminder: ${reminder.message}`,
      })
    },

    // Handle new messages from Electric (for future use)
    onMessage: async (c, message: {
      id: string
      channelId: string
      authorId: string
      content: string
    }) => {
      // Commands come via direct action calls
      // This handler is for future message-triggered behaviors
    },
  },
})

// Time parsing using Effect Duration
function parseReminderTime(input: string): Duration.Duration | null {
  const match = input.match(/^(\d+)(s|m|h|d)$/)
  if (!match) return null

  const [, amount, unit] = match
  const num = parseInt(amount, 10)

  switch (unit) {
    case "s": return Duration.seconds(num)
    case "m": return Duration.minutes(num)
    case "h": return Duration.hours(num)
    case "d": return Duration.days(num)
    default: return null
  }
}
```

### Rivet Server Entry (apps/bots/src/index.ts)

```typescript
import { setup } from "rivetkit"
import { reminderBot } from "@hazel/bots/actors"

export const registry = setup({
  use: {
    "reminder-bot": reminderBot,
  },
})

const { server } = registry.start({
  port: 3030,
})

console.log("Bot actors running on port 3030")
```

---

## Backend Integration

### Command Execution Flow

1. User types `/remind` → Frontend shows autocomplete from static command definitions
2. User fills arguments → Frontend calls `POST /bots/execute`
3. Backend validates request → Forwards to bot actor action
4. Actor processes command → Calls backend RPC to create response message
5. Response appears from bot user in channel/DM

### API Endpoints

```typescript
// Bot command execution
POST /bots/execute
  Request: { botId, commandName, channelId, arguments }
  Response: { success, responseMessage?, error? }

// Bot installation (per org)
POST   /orgs/:orgId/bots/:botId/install
DELETE /orgs/:orgId/bots/:botId
GET    /orgs/:orgId/bots  // List installed bots
```

### Database Schema

```sql
-- Bot installations (org-level)
CREATE TABLE bot_installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  bot_id VARCHAR(100) NOT NULL,
  installed_by UUID REFERENCES users(id),
  installed_at TIMESTAMPTZ DEFAULT NOW(),
  config JSONB DEFAULT '{}',
  UNIQUE(organization_id, bot_id)
);

CREATE INDEX idx_bot_installations_org ON bot_installations(organization_id);
```

Note: Reminders are stored in Rivet actor state, not in PostgreSQL.

---

## Directory Structure

```
packages/
├── bots/                          # Shared bot package
│   ├── src/
│   │   ├── index.ts              # Main exports
│   │   ├── types.ts              # Shared types
│   │   ├── commands.ts           # Command definitions (shared with frontend)
│   │   └── actors/
│   │       ├── index.ts          # Actor exports
│   │       ├── reminder-bot.ts   # Reminder bot actor
│   │       └── linear-bot.ts     # Linear bot actor (Phase 2)
│   └── package.json

apps/
├── bots/                          # Rivet server
│   ├── src/
│   │   ├── index.ts              # Server entry point
│   │   └── registry.ts           # Actor registry
│   └── package.json
├── backendv2/
│   └── src/
│       └── routes/
│           └── bots.http.ts      # Bot proxy endpoints
└── web/
    └── src/
        └── components/chat/
            └── slate-editor/
                └── autocomplete/
                    └── hooks/
                        └── use-bot-commands.ts  # Uses shared definitions
```

---

## Implementation Phases

### Phase 1: Core SDK + Reminder Bot

#### 1.1 Package Setup
- [ ] Create `packages/bots/` directory
- [ ] Create `packages/bots/package.json` with dependencies (rivetkit, effect)
- [ ] Create `packages/bots/tsconfig.json`
- [ ] Add `@hazel/bots` to root `package.json` workspaces
- [ ] Run `bun install` to link workspace

**Checkpoint:** `bun run typecheck` passes for packages/bots

#### 1.2 Command Definitions
- [ ] Create `packages/bots/src/types.ts` with BotCommandArgument, BotCommand, BotDefinition interfaces
- [ ] Create `packages/bots/src/commands.ts` with REMINDER_BOT definition
- [ ] Create `packages/bots/src/index.ts` exporting commands and types
- [ ] Verify frontend can import `@hazel/bots/commands`

**Checkpoint:** Can import types in apps/web without errors

#### 1.3 Rivet Server Setup
- [ ] Create `apps/bots/` directory
- [ ] Create `apps/bots/package.json` with rivetkit dependency
- [ ] Create `apps/bots/tsconfig.json`
- [ ] Create minimal `apps/bots/src/index.ts` entry point (empty registry)
- [ ] Add to `turbo.json` pipeline
- [ ] Add dev script to root package.json

**Checkpoint:** `bun run apps/bots/src/index.ts` starts Rivet server on port 3030

#### 1.4 Reminder Bot Actor (Core)
- [ ] Create `packages/bots/src/actors/reminder-bot.ts` with state interface
- [ ] Implement `createState` for org initialization
- [ ] Implement `remind` action (create reminder, schedule)
- [ ] Implement `reminders` action (list pending)
- [ ] Create `packages/bots/src/actors/index.ts` export

**Checkpoint:** Actor compiles, actions have correct types

#### 1.5 Register Actor in Rivet Server
- [ ] Create `apps/bots/src/registry.ts` importing reminderBot from packages/bots
- [ ] Update `apps/bots/src/index.ts` to use registry
- [ ] Start server and verify actor is registered

**Checkpoint:** Server starts, actor appears in registry

#### 1.6 Reminder Bot Actor (Scheduling)
- [ ] Implement `fireReminder` scheduled action
- [ ] Implement `cancelReminder` action
- [ ] Implement `onWake` to reschedule pending reminders
- [ ] Add `parseReminderTime` helper with Effect Duration

**Checkpoint:** Can create reminder and see scheduled action in state

#### 1.7 Test Actor Locally
- [ ] Call actor action via curl/HTTP client
- [ ] Verify state persistence after action
- [ ] Verify scheduled action fires
- [ ] Test actor hibernation and wake

**Checkpoint:** Can create reminder, wait, see it fire (manual test)

#### 1.8 Database Schema
- [ ] Create `packages/db/src/schema/bot-installations.ts`
- [ ] Add to schema index exports
- [ ] Generate migration with drizzle-kit
- [ ] Run migration

**Checkpoint:** `bot_installations` table exists in DB

#### 1.9 Backend API Definitions
- [ ] Create `packages/domain/src/http/bots.ts` with BotsApi group
- [ ] Define ExecuteCommandRequest/Response schemas
- [ ] Define install/uninstall/list endpoints
- [ ] Add to domain exports

**Checkpoint:** Types available in backend

#### 1.10 Backend Proxy Implementation
- [ ] Create `apps/backendv2/src/routes/bots.http.ts`
- [ ] Implement `executeCommand` handler (calls bot actor)
- [ ] Implement `installBot` handler (insert to DB)
- [ ] Implement `uninstallBot` handler (delete from DB)
- [ ] Implement `getInstalledBots` handler (query DB)
- [ ] Register routes in main HTTP app

**Checkpoint:** Can call `/bots/execute` endpoint via curl

#### 1.11 Backend → Actor Integration
- [ ] Create Rivet client in backend for calling actors
- [ ] Wire executeCommand to call actor action
- [ ] Handle actor response and create bot message via RPC
- [ ] Test full flow: API → Actor → Message

**Checkpoint:** Calling backend endpoint creates reminder and posts bot message

#### 1.12 Frontend Command Definitions
- [ ] Update `use-bot-commands.ts` to import from `@hazel/bots/commands`
- [ ] Query installed bots from new API
- [ ] Filter commands by installed bots
- [ ] Verify autocomplete shows /remind

**Checkpoint:** Typing `/remind` shows autocomplete

#### 1.13 Frontend Command Execution
- [ ] Update `slate-message-editor.tsx` to call new bot API
- [ ] Handle success response (show toast)
- [ ] Handle error response (show error toast)

**Checkpoint:** Executing /remind creates reminder, shows confirmation

#### 1.14 Bot Install UI
- [ ] Add "Bots" section to Settings > Integrations
- [ ] Show available bots (from ALL_BOTS)
- [ ] Show install/uninstall buttons
- [ ] Call install/uninstall API
- [ ] Refresh installed bots list

**Checkpoint:** Can install/uninstall Reminder Bot from UI

#### 1.15 DM Integration
- [ ] Implement `sendReminderDM` in actor (calls backend RPC)
- [ ] Backend creates DM message to user
- [ ] Test reminder fires and user receives DM

**Checkpoint:** Full reminder flow works end-to-end

#### 1.16 Polish & Error Handling
- [ ] Add proper error messages for invalid time format
- [ ] Add proper error messages for bot not installed
- [ ] Add loading states to UI
- [ ] Test edge cases (empty reminders, cancel non-existent)

**Checkpoint:** Phase 1 complete, ready for Phase 2

### Phase 2: Linear Bot Migration
- [ ] Create linear-bot actor
- [ ] Migrate /issue command from backend
- [ ] Actor fetches OAuth token from DB
- [ ] Calls Linear GraphQL API
- [ ] Deprecate old linear-command-executor.ts

### Phase 3: Cleanup
- [ ] Remove experimental/bot-sdk/ directory
- [ ] Remove old command-registry.ts
- [ ] Update documentation

---

## UI/UX Decisions

| Aspect | Decision |
|--------|----------|
| Command autocomplete | Uses static definitions from shared package |
| Error display | Ephemeral toast only (no chat messages) |
| Reminder notifications | DM to user |
| Bot install UI | Settings > Integrations section |
| Event handlers | messages.insert only for Phase 1 |

---

## Technical Decisions

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Actor isolation | Rivet actor isolation only | First-party bots, defer sandboxing |
| Electric scope | All org messages, filter in-actor | Simpler subscription management |
| Auth model | Internal network trust | Backend validates, actors trust backend |
| Time parsing | Effect Duration | Consistent with codebase patterns |
| Connection type | HTTP actions only | Simpler, no persistent WebSocket needed |

---

## Success Criteria

- [ ] Reminder bot works end-to-end (`/remind`, `/reminders`, DM notifications)
- [ ] Commands appear in slash command autocomplete
- [ ] Bot messages appear from bot user with correct avatar
- [ ] Actors hibernate when idle, wake on command
- [ ] Scheduled reminders survive actor hibernation
- [ ] Linear `/issue` migrated with no user-facing changes
