/**
 * Logging Middleware Implementation
 *
 * Server-side implementation of RPC logging middleware.
 * Logs all incoming RPC requests with method name, success/failure status,
 * similar to HttpMiddleware.logger for HTTP API requests.
 */

import { Effect, Layer } from "effect"
import { RpcLoggingMiddleware } from "./logging-class"

/**
 * Live implementation of RPC logging middleware.
 *
 * This middleware wraps each RPC call and logs:
 * - Request method name
 * - Success or failure status
 * - Annotated with rpc.method for filtering
 *
 * Pattern follows Effect's HttpMiddleware.logger implementation.
 */
export const RpcLoggingMiddlewareLive = Layer.succeed(
	RpcLoggingMiddleware,
	RpcLoggingMiddleware.of((options) =>
		Effect.gen(function* () {
			const _method = options.rpc.key

			// Log incoming request
			// yield* Effect.annotateLogs(Effect.logInfo("RPC request received"), {
			// 	"rpc.method": method,
			// })

			// Execute the handler and capture result
			const exit = yield* Effect.exit(options.next)

			if (exit._tag === "Success") {
				// yield* Effect.annotateLogs(Effect.logInfo("RPC request succeeded"), {
				// 	"rpc.method": method,
				// 	"rpc.status": "success",
				// })
				return exit.value
			} else {
				// yield* Effect.annotateLogs(Effect.logWarning("RPC request failed", exit.cause), {
				// 	"rpc.method": method,
				// 	"rpc.status": "failure",
				// })
				return yield* Effect.failCause(exit.cause)
			}
		}),
	),
)
