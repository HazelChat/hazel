import { HttpApiBuilder } from "@effect/platform"
import { Database, schema } from "@hazel/db"
import { Effect } from "effect"
import { eq } from "drizzle-orm"
import { HazelApi } from "../api"

/**
 * Internal API handlers for service-to-service communication.
 * These endpoints are used by the Rivet bot actor to update message state.
 */
export const HttpInternalLive = HttpApiBuilder.group(HazelApi, "internal", (handlers) =>
	Effect.gen(function* () {
		const db = yield* Database.Database

		return handlers.handle(
			"completeMessage",
			Effect.fn(function* ({ path, payload }) {
				yield* Effect.logInfo("Completing streaming message", {
					messageId: path.messageId,
					status: payload.status,
				})

				yield* db
					.execute((client) =>
						client
							.update(schema.messagesTable)
							.set({
								content: payload.content,
								liveObjectStatus: payload.status,
							})
							.where(eq(schema.messagesTable.id, path.messageId)),
					)
					.pipe(Effect.orDie)

				return { ok: true as const }
			}),
		)
	}),
)
