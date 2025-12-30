import { setup } from "rivetkit"
import { aiAgent } from "./actors/ai-agent.ts"

const PORT = Number(process.env.PORT ?? 8082)
const RIVET_ENDPOINT = process.env.RIVET_ENDPOINT ?? "http://localhost:6420"

export const registry = setup({
	use: { aiAgent },
})

registry.start({
	defaultServerPort: PORT,
	endpoint: RIVET_ENDPOINT,
})

console.log(`Rivet actors server running on port ${PORT}`)
console.log(`Connected to Rivet Engine at ${RIVET_ENDPOINT}`)
