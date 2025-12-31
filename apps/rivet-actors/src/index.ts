import { setup } from "rivetkit"
import { bot } from "./actors/bot.ts"

const PORT = Number(process.env.PORT ?? 8082)

export const registry = setup({
	use: { bot },
})

registry.start({
	defaultServerPort: PORT,
})

console.log(`Rivet actors server running on port ${PORT}`)
console.log(`Connected to Rivet Engine at ${process.env.RIVET_ENGINE}`)
