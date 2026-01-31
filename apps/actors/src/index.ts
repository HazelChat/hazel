import { registry } from "@hazel/actors"

const PORT = Number(process.env.PORT) || 3021

Bun.serve({
	port: PORT,
	fetch: (request: Request) => registry.handler(request),
})
