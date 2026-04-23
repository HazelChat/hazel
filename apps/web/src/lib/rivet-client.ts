import { createClient } from "rivetkit/client"
import type { Registry } from "@hazel/actors"
import { getClerkToken } from "~/lib/clerk-token"

/**
 * Get the current auth token (Clerk session JWT).
 */
export const getAccessToken = async (): Promise<string | null> => getClerkToken()

const RIVET_URL = import.meta.env.VITE_RIVET_URL || "http://localhost:6420"

export const rivetClient = createClient<Registry>(RIVET_URL)

/**
 * Get or create a message actor with authentication.
 * The Clerk session token is passed as a connection parameter.
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
