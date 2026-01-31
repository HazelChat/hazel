/**
 * MSW mock handler for SSE (Server-Sent Events) endpoint
 *
 * Simulates the backend's SSE command stream for testing reconnection behavior.
 *
 * SSE Protocol:
 * - Endpoint: GET /bot-commands/stream
 * - Response: text/event-stream
 * - Events: event: command\ndata: {...}\n\n
 */

import { http, HttpResponse, delay } from "msw"

interface CommandEvent {
	type: "command"
	commandName: string
	channelId: string
	userId: string
	orgId: string
	arguments: Record<string, string>
	timestamp: number
}

interface MockState {
	shouldFail: boolean
	failCount: number
	maxFailures: number
	events: CommandEvent[]
	delayMs: number
}

export interface SseMock {
	handler: ReturnType<typeof http.get>
	/** Trigger server errors for the next N requests */
	triggerError: (count?: number) => void
	/** Recover from error state */
	recover: () => void
	/** Push a command event to be sent */
	pushEvent: (event: CommandEvent) => void
	/** Clear all pending events */
	clearEvents: () => void
	/** Reset all state */
	reset: () => void
	/** Set response delay in ms */
	setDelay: (ms: number) => void
	/** Get current state for assertions */
	getState: () => Readonly<MockState>
}

/**
 * Create an MSW handler that simulates the SSE command stream
 */
export const createSseMock = (baseUrl: string): SseMock => {
	const state: MockState = {
		shouldFail: false,
		failCount: 0,
		maxFailures: 3,
		events: [],
		delayMs: 0,
	}

	const handler = http.get(`${baseUrl}/bot-commands/stream`, async ({ request }) => {
		// Check for authorization header
		const authHeader = request.headers.get("Authorization")
		if (!authHeader?.startsWith("Bearer ")) {
			return new HttpResponse(JSON.stringify({ error: "Unauthorized" }), {
				status: 401,
				headers: { "Content-Type": "application/json" },
			})
		}

		// Apply configured delay
		if (state.delayMs > 0) {
			await delay(state.delayMs)
		}

		// Simulate server error for reconnection testing
		if (state.shouldFail && state.failCount < state.maxFailures) {
			state.failCount++
			return new HttpResponse(JSON.stringify({ error: "Service temporarily unavailable" }), {
				status: 503,
				headers: { "Content-Type": "application/json" },
			})
		}

		// Build SSE response body from pending events
		const sseBody = state.events
			.map((event) => `event: command\ndata: ${JSON.stringify(event)}\n\n`)
			.join("")

		// Clear events after sending
		state.events = []

		return new HttpResponse(sseBody, {
			headers: {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
			},
		})
	})

	return {
		handler,

		triggerError: (count = 3) => {
			state.shouldFail = true
			state.maxFailures = count
			state.failCount = 0
		},

		recover: () => {
			state.shouldFail = false
			state.failCount = 0
		},

		pushEvent: (event: CommandEvent) => {
			state.events.push(event)
		},

		clearEvents: () => {
			state.events = []
		},

		reset: () => {
			state.shouldFail = false
			state.failCount = 0
			state.maxFailures = 3
			state.events = []
			state.delayMs = 0
		},

		setDelay: (ms: number) => {
			state.delayMs = ms
		},

		getState: () => ({ ...state, events: [...state.events] }),
	}
}

/**
 * Helper to create a command event for testing
 */
export const createCommandEvent = (commandName: string, args: Record<string, string> = {}): CommandEvent => ({
	type: "command",
	commandName,
	channelId: "ch_test-channel",
	userId: "usr_test-user",
	orgId: "org_test-org",
	arguments: args,
	timestamp: Date.now(),
})
