# Discord Bot Service

Two-way sync between Discord and Hazel via Discord Gateway.

## Why Gateway (not Webhooks)

Discord only sends message events (`MESSAGE_CREATE`, `MESSAGE_UPDATE`, `MESSAGE_DELETE`)
through the Gateway WebSocket. HTTP Interactions Endpoint only receives slash commands,
buttons, and modals.

## Architecture

```
Discord Server
      |
  Gateway WebSocket
      |
apps/discord-bot (this service)
      |
HTTP POST to cluster
      |
ChatBridgeInboundWorkflow
      |
Database (message created in Hazel)
```

## Required Discord Bot Permissions

- `GUILDS` - Access guild information
- `GUILD_MESSAGES` - Receive message events
- `MESSAGE_CONTENT` - Read message content (privileged intent)

## Environment Variables

- `DISCORD_BOT_TOKEN` - Bot token from Discord Developer Portal
- `CLUSTER_URL` - URL to the cluster service (e.g., http://localhost:3020)

## Related Code

- Cluster workflows: `apps/cluster/src/workflows/chat-bridge-*.ts`
- Workflow definitions: `packages/domain/src/cluster/workflows/`
- Discord REST client: `packages/integrations/src/discord/api-client.ts`
