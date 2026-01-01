/**
 * Bot Actors Server
 *
 * Rivet server running all bot actors.
 * Backend calls these actors to execute bot commands.
 */

import { registry } from "./registry.ts"

const PORT = Number.parseInt(process.env.BOTS_PORT ?? "3030", 10)

const { client, fetch: rivetFetch } = registry.start({
	// Disable built-in server so we can use Bun.serve with custom port
	disableDefaultServer: true,
	// Tell actors what address to use for cross-actor calls
	overrideServerAddress: `http://localhost:${PORT}`,
})

// Custom HTTP handler that routes external requests to actors via client API
async function handleRequest(req: Request): Promise<Response> {
	const url = new URL(req.url)

	// Route: POST /actors/:botId/actions/:actionName
	// This is called by the backend to execute bot commands
	const match = url.pathname.match(/^\/actors\/([^/]+)\/actions\/([^/]+)$/)
	if (match && req.method === "POST") {
		const [, botId, actionName] = match
		const body = await req.json()

		try {
			// Get actor and call action
			if (botId === "reminder-bot") {
				// Use orgId from request body as the actor key (one actor per org)
				const reqBody = body as { orgId?: string; [key: string]: unknown }
				const orgId = reqBody.orgId || "default"
				const actor = client["reminder-bot"].getOrCreate(orgId, {
					createWithInput: { orgId }, // Pass required input for createState
				})
				const result = await (actor as any)[actionName](reqBody)
				return Response.json({ success: true, ...result })
			}
			return Response.json({ error: `Unknown bot: ${botId}` }, { status: 404 })
		} catch (error) {
			return Response.json({ error: String(error) }, { status: 500 })
		}
	}

	// Health check
	if (url.pathname === "/health") {
		return new Response("OK")
	}

	// Fall back to Rivet's internal fetch handler for actor-to-actor calls
	return rivetFetch(req)
}

// Start Bun server
Bun.serve({
	port: PORT,
	fetch: handleRequest,
})

console.log(`Bot actors running on port ${PORT}`)

export { client, registry }
