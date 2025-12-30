import { createFileRoute } from "@tanstack/react-router"
import { createClient } from "rivetkit/client"
import { DurableStream } from "@durable-streams/client"
import { useCallback, useEffect, useRef, useState } from "react"

const RIVET_URL = "http://localhost:6420"
const STREAMS_URL = "http://localhost:8081/v1/stream"

const client = createClient(RIVET_URL)

interface PromptMessage {
	id: string
	content: string
	timestamp: number
}

interface ResponseChunk {
	promptId: string
	content: string
	isComplete: boolean
	timestamp: number
}

export const Route = createFileRoute("/test/streams")({
	component: StreamsTestPage,
})

function StreamsTestPage() {
	const [input, setInput] = useState("")
	const [messages, setMessages] = useState<Array<{ type: "prompt" | "response"; content: string }>>([])
	const [logs, setLogs] = useState<string[]>([])
	const [connected, setConnected] = useState(false)
	const [conversationId] = useState("test-conv-123")
	const abortRef = useRef<AbortController | null>(null)

	const log = useCallback((msg: string) => {
		const ts = new Date().toISOString().split("T")[1]?.slice(0, 12)
		setLogs((prev) => [...prev, `[${ts}] ${msg}`])
		console.log(msg)
	}, [])

	// Subscribe to response stream
	useEffect(() => {
		if (!connected) return

		const controller = new AbortController()
		abortRef.current = controller

		async function subscribeResponses() {
			const url = `${STREAMS_URL}/conversations/${conversationId}/responses`
			let stream: DurableStream
			try {
				stream = await DurableStream.create({ url, contentType: "application/json" })
			} catch {
				stream = new DurableStream({ url })
			}

			log("Subscribed to response stream")

			const session = await stream.stream({
				live: "long-poll",
				signal: controller.signal,
			})

			session.subscribeBytes(async (chunk) => {
				if (chunk.data.length === 0) return
				const text = new TextDecoder().decode(chunk.data)
				const lines = text.split("\n").filter((l) => l.trim())

				for (const line of lines) {
					try {
						const resp: ResponseChunk = JSON.parse(line)
						log(`Response: ${resp.content}`)
						setMessages((prev) => [...prev, { type: "response", content: resp.content }])
					} catch {
						// ignore parse errors
					}
				}
			})
		}

		subscribeResponses().catch((err) => log(`Subscribe error: ${err}`))

		return () => controller.abort()
	}, [connected, conversationId, log])

	const connect = useCallback(async () => {
		log("Connecting...")
		try {
			const echoActor = client.echo
			if (!echoActor) {
				log("Echo actor not available on client")
				return
			}
			await echoActor.create([conversationId], { input: { conversationId } })
			setConnected(true)
			log("Connected")
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err)
			if (msg.includes("already in use") || msg.includes("already_exists")) {
				setConnected(true)
				log("Connected to existing actor")
			} else {
				log(`Failed: ${err}`)
			}
		}
	}, [conversationId, log])

	const sendMessage = useCallback(async () => {
		if (!connected || !input.trim()) return

		const prompt: PromptMessage = {
			id: crypto.randomUUID(),
			content: input.trim(),
			timestamp: Date.now(),
		}

		log(`Sending: ${prompt.content}`)
		setMessages((prev) => [...prev, { type: "prompt", content: prompt.content }])

		const url = `${STREAMS_URL}/conversations/${conversationId}/prompts`
		let stream: DurableStream
		try {
			stream = await DurableStream.create({ url, contentType: "application/json" })
		} catch {
			stream = new DurableStream({ url })
		}

		await stream.append(JSON.stringify([prompt]) + "\n", { contentType: "application/json" })
		setInput("")
	}, [connected, conversationId, input, log])

	return (
		<div className="min-h-screen bg-gray-900 text-white p-8">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-2xl font-bold mb-4">Durable Streams Echo Test</h1>

				<div className="mb-4">
					<button
						onClick={connect}
						className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-medium"
					>
						Connect
					</button>
					{connected && <span className="ml-4 text-green-400">Connected</span>}
				</div>

				<div className="mb-6 flex gap-2">
					<input
						type="text"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && sendMessage()}
						placeholder="Type a message..."
						className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
					/>
					<button
						onClick={sendMessage}
						disabled={!connected}
						className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded font-medium"
					>
						Send
					</button>
				</div>

				<div className="mb-6">
					<h2 className="text-lg font-semibold mb-2">Messages</h2>
					<div className="bg-gray-800 border border-gray-700 rounded p-4 min-h-[200px]">
						{messages.length === 0 ? (
							<p className="text-gray-500">No messages yet. Connect and send a message.</p>
						) : (
							messages.map((m, i) => (
								<div
									key={i}
									className={`mb-2 ${m.type === "prompt" ? "text-blue-400" : "text-green-400"}`}
								>
									{m.type === "prompt" ? "→ " : "← "}
									{m.content}
								</div>
							))
						)}
					</div>
				</div>

				<div>
					<h2 className="text-lg font-semibold mb-2">Logs</h2>
					<div className="bg-gray-800 border border-gray-700 rounded p-4 h-[200px] overflow-y-auto font-mono text-xs">
						{logs.map((l, i) => (
							<div key={i} className="text-gray-400">
								{l}
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}
