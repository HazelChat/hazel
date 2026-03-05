import { DurableStreamTestServer, FileBackedStreamStore } from "@durable-streams/server"

const port = Number(process.env.DURABLE_STREAMS_PORT ?? "4437")
const host = process.env.DURABLE_STREAMS_HOST ?? "0.0.0.0"
const dataPath = process.env.DURABLE_STREAMS_DATA_PATH ?? "/data/streams"

const store = new FileBackedStreamStore({ dataDir: dataPath })
const server = new DurableStreamTestServer({
	port,
	host,
	store,
})

const url = await server.start()

console.log(`Durable Streams server running at ${url}`)
console.log(`Using file-backed storage at ${dataPath}`)

const shutdown = async (signal) => {
	console.log(`Received ${signal}, shutting down Durable Streams server...`)
	await server.stop()
	process.exit(0)
}

process.on("SIGINT", () => {
	void shutdown("SIGINT")
})

process.on("SIGTERM", () => {
	void shutdown("SIGTERM")
})
