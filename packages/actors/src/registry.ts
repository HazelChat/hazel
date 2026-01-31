import { setup } from "rivetkit"
import { messageActor } from "./actors/message-actor"

/**
 * Registry of all actors available in the system.
 *
 * RivetKit Architecture:
 * - Local dev: Engine spawned via RIVET_RUN_ENGINE=1, stores state in file system
 * - Production: Connects to Rivet Cloud via RIVET_ENDPOINT
 *
 * Data flow:
 * 1. Client connects to Engine (port 6420 local, or api.rivet.dev production)
 * 2. Engine calls /api/rivet/start on this serverless backend to run actors
 * 3. Actor state is persisted by the Engine
 *
 * Environment variables for production (Rivet Cloud):
 * - RIVET_ENDPOINT: Private endpoint for backend -> Rivet
 * - RIVET_PUBLIC_ENDPOINT: Public endpoint for client -> Rivet
 *
 * Usage:
 * - Server: `registry.handler(request)` for HTTP endpoints at /api/rivet/*
 * - Client: Use the typed client from `@hazel/actors/client`
 */
export const registry = setup({
	use: {
		message: messageActor,
	},
})

export type Registry = typeof registry
