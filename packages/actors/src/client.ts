import { createClient } from "rivetkit/client"
import type { Registry } from "./registry"

/**
 * Creates a typed RivetKit client for interacting with actors.
 *
 * RivetKit Architecture:
 * - Clients connect to the Rivet Engine (gateway for actor communication)
 * - The Engine routes requests to the serverless backend when actors need to run
 *
 * @param endpoint - The URL endpoint (defaults based on environment):
 *   - Local dev: http://localhost:6420 (local Rivet Engine)
 *   - Production: Uses RIVET_PUBLIC_ENDPOINT for Rivet Cloud
 *
 * @example
 * ```typescript
 * import { createActorsClient } from "@hazel/actors/client"
 *
 * const client = createActorsClient()
 * const actor = client.message.getOrCreate([messageId])
 * await actor.start({ service: "api" })
 * await actor.setProgress(50)
 * await actor.complete()
 * ```
 */
export function createActorsClient(endpoint?: string) {
	// Clients connect to the Rivet Engine:
	// - Local dev: Engine spawned by actors service on port 6420
	// - Production: Rivet Cloud endpoint (api.rivet.dev)
	const url =
		endpoint ?? process.env.RIVET_PUBLIC_ENDPOINT ?? process.env.RIVET_URL ?? "http://localhost:6420"
	return createClient<Registry>(url)
}

export type ActorsClient = ReturnType<typeof createActorsClient>
