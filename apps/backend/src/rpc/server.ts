import { RpcServer } from "@effect/rpc"
import { Layer } from "effect"
import { MessageRpcs } from "./groups/messages"
import { MessageRpcLive } from "./handlers/messages"
import { AuthMiddlewareLive } from "./middleware/auth"

/**
 * RPC Server Configuration
 *
 * This file sets up the Effect RPC server with all RPC groups and their handlers.
 *
 * Architecture:
 * 1. Define RPC groups (in ./groups/*.ts) - API schema definitions
 * 2. Implement handlers (in ./handlers/*.ts) - Business logic
 * 3. Combine into server layer (here) - Server setup
 * 4. Add HTTP protocol (in index.ts) - Transport layer
 *
 * Current RPC Groups:
 * - MessageRpcs: Message CRUD operations (create, update, delete)
 *
 * Planned RPC Groups (will be added during migration):
 * - ChannelRpcs: Channel operations
 * - OrganizationRpcs: Organization management
 * - UserRpcs: User operations
 * - And more...
 */

/**
 * Combined RPC Server Layer
 *
 * Combines all RPC handlers and provides the complete RPC server.
 * New RPC groups should be added here as they're migrated from HttpApi.
 *
 * Example of adding a new RPC group:
 * ```typescript
 * import { ChannelRpcLive } from "./handlers/channels"
 * import { ChannelRpcs } from "./groups/channels"
 *
 * export const RpcServerLive = RpcServer.layer(MessageRpcs, ChannelRpcs).pipe(
 *   Layer.provide(MessageRpcLive),
 *   Layer.provide(ChannelRpcLive),
 *   Layer.provide(AuthMiddlewareLive)
 * )
 * ```
 */
export const RpcServerLive = RpcServer.layer(
	MessageRpcs, // Add more RPC groups here as they're migrated
).pipe(
	Layer.provide(MessageRpcLive), // Provide handler implementation
	Layer.provide(AuthMiddlewareLive), // Provide auth middleware
)
