import { setup } from "rivetkit"
import { echo } from "./actors/echo.ts"

const PORT = Number(process.env.PORT ?? 8082)

export const registry = setup({
	use: { echo },
})

registry.start({
	defaultServerPort: PORT,
})

console.log(`Rivet actors server running on port ${PORT}`)
console.log(`Connected to Rivet Engine at ${process.env.RIVET_ENGINE}`)
