import { Cookies, HttpServerRequest } from "@effect/platform"
import { CurrentUser } from "@hazel/effect-lib"
import { WorkOS as WorkOSNodeAPI } from "@workos-inc/node"
import { Config, Data, Effect, Redacted } from "effect"

export class WorkOSApiError extends Data.TaggedError("WorkOSApiError")<{
	readonly cause: unknown
}> {}

export class WorkOS extends Effect.Service<WorkOS>()("Workos", {
	accessors: true,
	effect: Effect.gen(function* () {
		const apiKey = yield* Config.redacted("WORKOS_API_KEY")
		const clientId = yield* Config.string("WORKOS_CLIENT_ID")

		const cookiePassword = yield* Config.redacted("WORKOS_COOKIE_PASSWORD")

		const workosClient = new WorkOSNodeAPI(Redacted.value(apiKey), {
			clientId,
		})

		const call = <A>(f: (client: WorkOSNodeAPI, signal: AbortSignal) => Promise<A>) =>
			Effect.tryPromise({
				try: (signal) => f(workosClient, signal),
				catch: (cause) => new WorkOSApiError({ cause }),
			})

		const loadSealedSession = Effect.fn("WorkOS.loadSealedSession")(function* (sessionCookie: string) {
			const session = yield* call(async (client) =>
				client.userManagement.loadSealedSession({
					sessionData: sessionCookie,
					cookiePassword: Redacted.value(cookiePassword),
				}),
			)

			return session
		})

		const getLogoutUrl = Effect.fn("WorkOS.getLogoutUrl")(function* () {
			const request = yield* HttpServerRequest.HttpServerRequest
			const workOsCookie = request.cookies[CurrentUser.Cookie.key]

			const session = yield* loadSealedSession(workOsCookie)

			const logoutUrl = yield* Effect.tryPromise({
				try: () => session.getLogoutUrl(),
				catch: (error) => {
					return new WorkOSApiError({ cause: error })
				},
			})

			return logoutUrl
		})

		return {
			call,
			loadSealedSession,
			getLogoutUrl,
		}
	}),
}) {}
