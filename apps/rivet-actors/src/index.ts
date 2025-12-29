import { setup } from "rivetkit"
import { aiAgent } from "./actors/ai-agent.ts"

const PORT = Number(process.env.PORT ?? 8082)

export const registry = setup({
	use: { aiAgent },
})

// Run the actor server with embedded engine for actor management
registry.start({
	defaultServerPort: PORT,
	runEngine: true, // Enable embedded Rivet Engine for actor spawning
})

console.log(`Rivet actors server running on port ${PORT}`)
