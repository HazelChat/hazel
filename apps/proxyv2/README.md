# Electric SQL Proxy (Cloudflare Worker)

A lightweight proxy for Electric SQL that handles request forwarding, authentication, and CORS configuration.

## Overview

This Cloudflare Worker acts as a proxy between your frontend application and the Electric SQL service. It forwards Electric protocol requests while adding authentication and handling CORS headers.

Based on the official Electric SQL example: [tanstack-db-web-starter](https://github.com/electric-sql/electric/tree/main/examples/tanstack-db-web-starter)

## Architecture

```
Frontend (TanStack DB) → Cloudflare Worker Proxy → Electric SQL Service
                         (apps/proxyv2)           (port 5133)
```

## Features

- Forwards Electric protocol query parameters (table, offset, cursor, etc.)
- Handles GET and DELETE requests (Electric protocol)
- Automatic CORS header configuration
- Support for Electric Cloud authentication (source_id, secret)
- Streaming response passthrough
- No state management - pure proxy

## Local Development

### Start the proxy:

```bash
cd apps/proxyv2
bunx wrangler dev
```

The proxy will start on `http://localhost:8788`

### Environment Variables

Create `.dev.vars` file for local development:

```bash
ELECTRIC_URL=http://localhost:5133
# Optional: For Electric Cloud
# ELECTRIC_SOURCE_ID=your-source-id
# ELECTRIC_SOURCE_SECRET=your-source-secret
```

### Test the proxy:

```bash
# Test basic connectivity
curl "http://localhost:8788/v1/shape?table=organizations&offset=-1"

# Test CORS preflight
curl -X OPTIONS "http://localhost:8788/v1/shape"
```

## Deployment

### Deploy to Cloudflare:

```bash
bunx wrangler deploy
```

### Set production environment variables:

```bash
bunx wrangler secret put ELECTRIC_URL
# Enter: your-electric-production-url

# Optional: For Electric Cloud
bunx wrangler secret put ELECTRIC_SOURCE_ID
bunx wrangler secret put ELECTRIC_SOURCE_SECRET
```

### Update frontend environment:

```bash
# In apps/web/.env or .env.production
VITE_ELECTRIC_URL=https://your-worker.your-domain.workers.dev/v1/shape
```

## How It Works

### 1. Request Flow

1. Frontend makes request to proxy: `http://localhost:8788/v1/shape?table=users&offset=-1`
2. Proxy extracts Electric protocol params (table, offset, cursor, etc.)
3. Proxy builds Electric URL: `http://localhost:5133/v1/shape?table=users&offset=-1`
4. Proxy adds authentication if configured
5. Proxy forwards request to Electric
6. Proxy streams response back to frontend with modified headers

### 2. Electric Protocol Parameters

The following query parameters are forwarded to Electric:

- `offset` - Starting offset for shape data
- `handle` - Shape handle for reconnection
- `live` - Enable live streaming
- `shape_id` - Shape identifier
- `cursor` - Cursor for pagination
- `table` - Table name to query
- `where` - SQL WHERE clause
- `columns` - Column selection
- `replica` - Replica selection

### 3. Response Headers

The proxy modifies response headers for proper streaming:

- Removes: `content-encoding`, `content-length` (for streaming)
- Adds: `vary: cookie` (for caching)
- Adds: CORS headers (`Access-Control-Allow-*`)
- Preserves: All Electric headers (`electric-*`)

## Configuration

### wrangler.jsonc

```jsonc
{
  "name": "proxyv2",
  "main": "src/index.ts",
  "compatibility_date": "2025-11-19",
  "vars": {
    "ELECTRIC_URL": "http://localhost:5133"
  }
}
```

### .dev.vars (local only)

```bash
ELECTRIC_URL=http://localhost:5133
```

## Future Enhancements

### Authentication & Authorization

When ready to add auth, modify `src/index.ts`:

```typescript
// 1. Extract auth token from request
const authHeader = request.headers.get("Authorization")

// 2. Validate session/token
const session = await validateSession(authHeader)
if (!session) {
  return new Response("Unauthorized", { status: 401 })
}

// 3. Add user-scoped filters to Electric URL
originUrl.searchParams.set("where", `user_id = '${session.userId}'`)
```

### Custom Headers

Add custom headers to forwarded requests:

```typescript
const response = await fetch(originUrl.toString(), {
  method,
  headers: {
    "Content-Type": "application/json",
    "X-Custom-Header": "value",
  },
})
```

### Rate Limiting

Implement rate limiting with Cloudflare Durable Objects or KV.

## Troubleshooting

### Proxy not starting

Check that port 8788 is available:
```bash
lsof -ti:8788
```

### Electric not responding

Verify Electric is running:
```bash
lsof -ti:5133
```

### CORS errors

Ensure CORS headers are properly set in `src/index.ts`:
```typescript
headers.set("Access-Control-Allow-Origin", "*")
headers.set("Access-Control-Allow-Methods", "GET, DELETE, OPTIONS")
headers.set("Access-Control-Allow-Headers", "*")
```

### Frontend can't connect

1. Check `VITE_ELECTRIC_URL` in `apps/web/.env`
2. Restart Vite dev server after changing env vars
3. Verify proxy is running with `curl` test

## Related Files

- Frontend collections: `apps/web/src/db/collections.ts`
- Frontend env config: `apps/web/.env`
- Domain models: `packages/domain/src/models/`
- Effect Electric package: `packages/effect-electric-db-collection/`

## Resources

- [Electric SQL Docs](https://electric-sql.com)
- [Cloudflare Workers](https://developers.cloudflare.com/workers)
- [TanStack DB](https://tanstack.com/db)
