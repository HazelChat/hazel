# Implementation Guide

## Dependencies

- `discord.js` - Official Discord SDK with Gateway support
- `effect` - For Effect-TS patterns
- `@effect/platform` - HTTP client for calling cluster

## Step 1: Gateway Connection

Connect to Discord Gateway with required intents:

```typescript
import { Client, GatewayIntentBits, Events } from "discord.js"

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
})

client.login(process.env.DISCORD_BOT_TOKEN)
```

## Step 2: Message Event Handlers

```typescript
client.on(Events.MessageCreate, async (message) => {
  // Skip bot messages
  if (message.author.bot) return

  // Call ChatBridgeInboundWorkflow
  await triggerInboundWorkflow({
    provider: "discord",
    eventType: "create",
    externalWorkspaceId: message.guildId,
    externalChannelId: message.channelId,
    externalMessageId: message.id,
    authorId: message.author.id,
    authorName: message.author.username,
    authorAvatarUrl: message.author.displayAvatarURL(),
    content: message.content,
    timestamp: message.createdAt,
  })
})
```

## Step 3: Cluster Integration

POST to cluster HTTP API:

```typescript
const triggerInboundWorkflow = async (payload) => {
  await fetch(`${CLUSTER_URL}/workflows/ChatBridgeInboundWorkflow/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
}
```

## Step 4: Outbound Sync (Hazel -> Discord)

The outbound workflow in cluster needs to be updated to actually send messages.
Currently has a TODO. Options:

1. Call Discord webhook URL stored in channel link config
2. Use Discord REST API via bot token (send message to channel)

Option 1 is simpler and already partially implemented in cluster.

## Effect-TS Integration

For proper Effect integration, wrap the discord.js client:

```typescript
import { Effect, Layer } from "effect"
import { Client, GatewayIntentBits, Events } from "discord.js"

export class DiscordGateway extends Effect.Service<DiscordGateway>()("DiscordGateway", {
  effect: Effect.gen(function* () {
    const token = yield* Config.string("DISCORD_BOT_TOKEN")

    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    })

    // Login and return event stream
    yield* Effect.promise(() => client.login(token))

    return {
      client,
      onMessage: (handler) => {
        client.on(Events.MessageCreate, handler)
      },
    }
  }),
}) {}
```

## Message Filtering

The bot should only process messages from linked channels:

```typescript
client.on(Events.MessageCreate, async (message) => {
  // Skip bots
  if (message.author.bot) return

  // Skip DMs
  if (!message.guild) return

  // The workflow will check if the channel is linked
  // and skip processing if not
  await triggerInboundWorkflow(...)
})
```
