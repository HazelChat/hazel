/**
 * Durable Streams server for development
 *
 * Uses the official @durable-streams/server package to provide
 * an HTTP server implementing the Durable Streams protocol.
 */

import { DurableStreamTestServer } from "@durable-streams/server"

const PORT = Number(process.env.PORT ?? 8081)
const HOST = process.env.HOST ?? "127.0.0.1"

const server = new DurableStreamTestServer({
	port: PORT,
	host: HOST,
	longPollTimeout: 30_000,
})

const url = await server.start()

console.log(`Durable Streams server running at ${url}`)
console.log(`Stream URL pattern: ${url}v1/stream/{name}`)
