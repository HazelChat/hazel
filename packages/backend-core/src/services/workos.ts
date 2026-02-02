import { WorkOS as WorkOSNodeAPI } from "@workos-inc/node"
import { Config, Effect, Redacted, Schema } from "effect"

export class WorkOSApiError extends Schema.TaggedError<WorkOSApiError>()("WorkOSApiError", {
	cause: Schema.Unknown,
}) {}

export class WorkOSClient extends Effect.Service<WorkOSClient>()("WorkOSClient", {
	accessors: true,
	effect: Effect.gen(function* () {
		const apiKey = yield* Config.redacted("WORKOS_API_KEY")
		const clientId = yield* Config.string("WORKOS_CLIENT_ID")

		const workosClient = new WorkOSNodeAPI(Redacted.value(apiKey), {
			clientId,
		})

		const call = <A>(f: (client: WorkOSNodeAPI, signal: AbortSignal) => Promise<A>) =>
			Effect.tryPromise({
				try: (signal) => f(workosClient, signal),
				catch: (cause) => new WorkOSApiError({ cause }),
			}).pipe(Effect.tapError((error) => Effect.logError("WorkOS API error", error)))

		return {
			call,
		}
	}),
}) {}
