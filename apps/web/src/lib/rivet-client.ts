import { createClient } from "rivetkit/client"
import type { Registry } from "@hazel/actors"
import { Effect, Option } from "effect"
import { TokenStorage } from "./services/desktop/token-storage"
import { WebTokenStorage } from "./services/web/token-storage"
import { isTauri } from "./tauri"
import { getWebAccessToken } from "~/atoms/web-auth"

const RIVET_URL = import.meta.env.VITE_RIVET_URL || "http://localhost:6420"

/**
 * Typed RivetKit client for interacting with message actors.
 *
 * @example
 * ```typescript
 * import { getAuthenticatedMessageActor } from "~/lib/rivet-client"
 *
 * const actor = await getAuthenticatedMessageActor([messageId])
 * const conn = actor.connect()
 *
 * conn.on("textChunk", ({ chunk }) => console.log(chunk))
 * await conn.start({ model: "claude-3" })
 * ```
 */
export const rivetClient = createClient<Registry>(RIVET_URL)

/**
 * Get the current access token from appropriate storage (desktop or web).
 * Returns null if no token is available.
 */
export async function getAccessToken(): Promise<string | null> {
	if (isTauri()) {
		// Desktop: use Tauri store
		return Effect.runPromise(
			Effect.gen(function* () {
				const tokenStorage = yield* TokenStorage
				const tokenOpt = yield* tokenStorage.getAccessToken
				return Option.getOrNull(tokenOpt)
			}).pipe(
				Effect.provide(TokenStorage.Default),
				Effect.catchAll(() => Effect.succeed(null)),
			),
		)
	}

	// Web: use localStorage
	return getWebAccessToken()
}

/**
 * Get or create a message actor with authentication.
 * The token is passed as a connection parameter for actor authentication.
 *
 * @param key - The actor key (e.g., [messageId])
 * @param createWithInput - Optional initial data for the actor
 * @returns The actor handle with auth params configured
 * @throws Error if no access token is available
 *
 * @example
 * ```typescript
 * const actor = await getAuthenticatedMessageActor([messageId])
 * await actor.start({ model: "claude-3" })
 * ```
 */
export async function getAuthenticatedMessageActor(
	key: string[],
	createWithInput?: { initialData?: Record<string, unknown> },
) {
	const token = await getAccessToken()
	if (!token) {
		throw new Error("Authentication required: No access token available")
	}

	return rivetClient.message.getOrCreate(key, {
		params: { token },
		...(createWithInput && { createWithInput }),
	})
}

/**
 * Create a message actor handle with a provided token.
 * Use this when you already have the token available.
 *
 * @param key - The actor key (e.g., [messageId])
 * @param token - The auth token (JWT or bot token)
 * @param createWithInput - Optional initial data for the actor
 * @returns The actor handle with auth params configured
 */
export function getMessageActorWithToken(
	key: string[],
	token: string,
	createWithInput?: { initialData?: Record<string, unknown> },
) {
	return rivetClient.message.getOrCreate(key, {
		params: { token },
		...(createWithInput && { createWithInput }),
	})
}
