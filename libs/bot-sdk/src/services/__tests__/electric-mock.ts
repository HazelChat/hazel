/**
 * MSW mock handler for ElectricSQL HTTP protocol
 *
 * Simulates the Electric sync service for testing ShapeStream reconnection behavior.
 *
 * ElectricSQL HTTP Protocol:
 * - Endpoint: GET <url>?table=<table>&offset=<offset>... (query params on base URL)
 * - Response: JSON array of messages
 * - Required headers: electric-handle, electric-offset, electric-schema, electric-up-to-date
 */

import { http, HttpResponse, delay } from "msw"

interface ElectricMessage {
	key?: string
	value?: Record<string, unknown>
	headers: {
		operation?: "insert" | "update" | "delete"
		control?: "up-to-date" | "must-refetch"
	}
}

interface MockState {
	offset: number
	shouldFail: boolean
	failCount: number
	maxFailures: number
	messages: ElectricMessage[]
	delayMs: number
	requestCount: number
}

export interface ElectricMock {
	handler: ReturnType<typeof http.get>
	/** Trigger server errors for the next N requests */
	triggerError: (count?: number) => void
	/** Recover from error state */
	recover: () => void
	/** Push a message to be returned on next request */
	pushMessage: (msg: ElectricMessage) => void
	/** Push multiple messages */
	pushMessages: (msgs: ElectricMessage[]) => void
	/** Clear all pending messages */
	clearMessages: () => void
	/** Reset all state */
	reset: () => void
	/** Set response delay in ms */
	setDelay: (ms: number) => void
	/** Get current state for assertions */
	getState: () => Readonly<MockState>
}

/**
 * Create an MSW handler that simulates ElectricSQL's HTTP API
 *
 * Electric client makes requests directly to the base URL with query params,
 * e.g., http://localhost:3060/?table=messages&offset=-1
 */
export const createElectricMock = (baseUrl: string): ElectricMock => {
	const state: MockState = {
		offset: 0,
		shouldFail: false,
		failCount: 0,
		maxFailures: 3,
		messages: [],
		delayMs: 0,
		requestCount: 0,
	}

	// Match any request to the base URL (Electric uses query params, not path)
	const handler = http.get(
		new RegExp(`^${baseUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/?`),
		async ({ request }) => {
			const url = new URL(request.url)
			const requestOffset = url.searchParams.get("offset")
			const table = url.searchParams.get("table") || "unknown"

			state.requestCount++

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

			// Prepare response messages
			const responseMessages: ElectricMessage[] = [...state.messages]

			// Always include an up-to-date control message at the end
			responseMessages.push({
				headers: { control: "up-to-date" },
			})

			// Clear messages after sending (they've been "consumed")
			state.messages = []

			// Increment offset
			const newOffset = `0_${++state.offset}`

			// Generate cursor for live polling
			const cursor = `cursor_${state.offset}`

			return HttpResponse.json(responseMessages, {
				headers: {
					"Content-Type": "application/json",
					"electric-handle": `test-handle-${table}`,
					"electric-offset": newOffset,
					"electric-cursor": cursor,
					"electric-schema": JSON.stringify({
						id: { type: "text" },
						content: { type: "text" },
						createdAt: { type: "timestamp" },
					}),
					"electric-up-to-date": "true",
				},
			})
		},
	)

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

		pushMessage: (msg: ElectricMessage) => {
			state.messages.push(msg)
		},

		pushMessages: (msgs: ElectricMessage[]) => {
			state.messages.push(...msgs)
		},

		clearMessages: () => {
			state.messages = []
		},

		reset: () => {
			state.offset = 0
			state.shouldFail = false
			state.failCount = 0
			state.maxFailures = 3
			state.messages = []
			state.delayMs = 0
			state.requestCount = 0
		},

		setDelay: (ms: number) => {
			state.delayMs = ms
		},

		getState: () => ({ ...state, messages: [...state.messages] }),
	}
}

/**
 * Helper to create a change message for testing
 */
export const createChangeMessage = (
	operation: "insert" | "update" | "delete",
	key: string,
	value: Record<string, unknown>,
): ElectricMessage => ({
	key,
	value,
	headers: { operation },
})
