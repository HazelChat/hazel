/**
 * Integration tests for AI streaming to Durable Streams
 *
 * Tests the complete data flow:
 * 1. Backend creates response stream
 * 2. Frontend subscribes to response stream (long-poll)
 * 3. AI processor writes response chunks
 * 4. Frontend receives chunks in real-time
 */

import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from "vitest"
import { DurableStreamTestServer } from "@durable-streams/server"
import { DurableStream } from "@durable-streams/client"
import type { ResponseChunk } from "../types.ts"

// Mock AI SDK
vi.mock("ai", () => ({
	streamText: vi.fn(() => ({
		textStream: (async function* () {
			yield "Hello"
			yield " "
			yield "from"
			yield " "
			yield "AI"
		})(),
	})),
}))

vi.mock("@openrouter/ai-sdk-provider", () => ({
	createOpenRouter: vi.fn(() => vi.fn((model: string) => ({ modelId: model }))),
}))

describe("AI Streaming Integration", () => {
	let server: DurableStreamTestServer
	let serverUrl: string
	const originalEnv = { ...process.env }

	beforeAll(async () => {
		server = new DurableStreamTestServer({
			port: 0,
			host: "127.0.0.1",
			longPollTimeout: 10_000,
		})
		serverUrl = await server.start()
		process.env.STREAMS_SERVER_URL = serverUrl
		process.env.API_BASE_URL = "http://localhost:3003"
	})

	afterAll(async () => {
		process.env = originalEnv
		await server.stop()
	})

	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("should stream AI response chunks to durable stream", async () => {
		const messageId = `test-${Date.now()}`
		const responseStreamUrl = `${serverUrl}/v1/stream/msg-${messageId}-responses`

		// 1. Create response stream (simulates backend)
		await DurableStream.create({
			url: responseStreamUrl,
			contentType: "application/json",
		})

		// 2. Start consuming response stream (simulates frontend with long-poll)
		const receivedChunks: ResponseChunk[] = []
		const controller = new AbortController()

		const frontendStream = new DurableStream({ url: responseStreamUrl })
		const session = await frontendStream.stream({
			offset: "-1",
			live: "long-poll",
			signal: controller.signal,
		})

		const consumePromise = new Promise<void>((resolve, reject) => {
			const timeout = setTimeout(() => reject(new Error("Timeout")), 8000)

			session.subscribeJson<string>(async (batch) => {
				for (const rawItem of batch.items) {
					if (typeof rawItem !== "string") continue
					const trimmed = rawItem.trim()
					if (!trimmed) continue
					try {
						const chunk = JSON.parse(trimmed) as ResponseChunk
						receivedChunks.push(chunk)
						if (chunk.type === "complete") {
							clearTimeout(timeout)
							resolve()
						}
					} catch {
						// Skip malformed items
					}
				}
			})
		})

		// 3. Process AI message (writes chunks to response stream)
		const { processAIMessage } = await import("../actors/ai-agent.ts")
		await processAIMessage(messageId, "Hello")

		// 4. Wait for frontend to receive all chunks
		try {
			await consumePromise
		} finally {
			controller.abort()
		}

		// 5. Verify results
		const dataChunks = receivedChunks.filter((c) => c.type === "chunk")
		const completeChunks = receivedChunks.filter((c) => c.type === "complete")

		expect(dataChunks.length).toBeGreaterThan(0)
		expect(completeChunks.length).toBe(1)

		const fullContent = dataChunks.map((c) => c.content).join("")
		expect(fullContent).toBe("Hello from AI")
	})

	it("should allow frontend to subscribe AFTER data is written", async () => {
		const messageId = `late-${Date.now()}`
		const responseStreamUrl = `${serverUrl}/v1/stream/msg-${messageId}-responses`

		// 1. Create stream and write data FIRST
		await DurableStream.create({
			url: responseStreamUrl,
			contentType: "application/json",
		})

		const { processAIMessage } = await import("../actors/ai-agent.ts")
		await processAIMessage(messageId, "Test prompt")

		// 2. NOW frontend subscribes with offset=-1 (should get all historical data)
		const receivedChunks: ResponseChunk[] = []
		const controller = new AbortController()

		const frontendStream = new DurableStream({ url: responseStreamUrl })
		const session = await frontendStream.stream({
			offset: "-1",
			live: "long-poll",
			signal: controller.signal,
		})

		await new Promise<void>((resolve) => {
			session.subscribeJson<string>(async (batch) => {
				for (const rawItem of batch.items) {
					if (typeof rawItem !== "string") continue
					try {
						const chunk = JSON.parse(rawItem.trim()) as ResponseChunk
						receivedChunks.push(chunk)
						if (chunk.type === "complete") resolve()
					} catch {
						// Skip malformed
					}
				}
			})
			setTimeout(resolve, 2000)
		})

		controller.abort()

		// Should have received all historical data
		expect(receivedChunks.length).toBeGreaterThan(0)
		expect(receivedChunks.some((c) => c.type === "complete")).toBe(true)
	})

	it("should handle streaming errors gracefully", async () => {
		const { streamText } = await import("ai")

		// Mock an error
		vi.mocked(streamText).mockImplementationOnce(
			() =>
				({
					textStream: (async function* () {
						throw new Error("AI service unavailable")
					})(),
				}) as unknown as ReturnType<typeof streamText>,
		)

		const messageId = `error-${Date.now()}`
		const responseStreamUrl = `${serverUrl}/v1/stream/msg-${messageId}-responses`

		await DurableStream.create({
			url: responseStreamUrl,
			contentType: "application/json",
		})

		const { processAIMessage } = await import("../actors/ai-agent.ts")
		await processAIMessage(messageId, "Test prompt")

		// Read the stream
		const reader = new DurableStream({ url: responseStreamUrl })
		const response = await reader.stream({ offset: "-1", live: false })
		const text = await response.text()

		const rawItems = JSON.parse(text) as string[]
		const chunks = rawItems
			.map((s) => s.trim())
			.filter((s) => s.length > 0)
			.map((s) => JSON.parse(s))

		const errorChunks = chunks.filter((c: ResponseChunk) => c.type === "error")
		expect(errorChunks.length).toBe(1)
		expect(errorChunks[0].error).toContain("AI service unavailable")
	})
})
