import { setup } from "rivetkit"
import { aiAgent } from "./actors/ai-agent.ts"

const PORT = Number(process.env.PORT ?? 8082)

export const registry = setup({
	use: { aiAgent },
})

// Run the actor server
registry.start({
	defaultServerPort: PORT,
})

console.log(`Rivet actors server running on port ${PORT}`)
