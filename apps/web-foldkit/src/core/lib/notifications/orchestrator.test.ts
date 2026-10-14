import { beforeEach, describe, expect, it } from "vitest"
import { clearNotificationDiagnostics, getNotificationDiagnostics } from "./diagnostics-store"
import { NotificationOrchestrator } from "./orchestrator"
import type { NotificationDecision, NotificationEvent, NotificationSink } from "./types"

class RecordingSink implements NotificationSink {
	public handled: Array<{ id: string; decision: NotificationDecision }> = []
	private readonly sink: "in-app" | "sound" | "native"

	constructor(sink: "in-app" | "sound" | "native") {
		this.sink = sink
	}

	async handle(event: NotificationEvent, decision: NotificationDecision) {
		this.handled.push({ id: event.id, decision })
		return {
			sink: this.sink,
			status: "sent" as const,
			reason: "ok" as const,
		}
	}
}

const waitFor = async (predicate: () => boolean) => {
	for (let i = 0; i < 40; i++) {
		if (predicate()) return
		await new Promise((resolve) => setTimeout(resolve, 5))
	}
	throw new Error("Timed out waiting for predicate")
}

const createEvent = (id: string, createdAt: string, channelId: string | null = null): NotificationEvent => ({
	id,
	notification: {
		id,
		memberId: "member-1",
		targetedResourceId: channelId,
		targetedResourceType: channelId ? "channel" : null,
		resourceId: null,
		resourceType: null,
		createdAt: new Date(createdAt),
		readAt: null,
	} as any,
	receivedAt: Date.now(),
})

describe("NotificationOrchestrator", () => {
	beforeEach(() => {
		clearNotificationDiagnostics()
	})

	it("processes events in chronological order", async () => {
		const inApp = new RecordingSink("in-app")
		const sound = new RecordingSink("sound")
		const native = new RecordingSink("native")
		const orchestrator = new NotificationOrchestrator()

		orchestrator.setDependencies({
			getContext: () => ({
				currentChannelId: null,
				sessionStartTime: new Date("2024-01-01T00:00:00Z"),
				isMuted: false,
				isWindowFocused: false,
				visibilityState: "hidden",
				now: Date.now(),
			}),
			inAppSink: inApp,
			soundSink: sound,
			nativeSink: native,
		})

		orchestrator.enqueue([
			createEvent("n2", "2025-01-01T10:00:02Z"),
			createEvent("n1", "2025-01-01T10:00:01Z"),
		])

		await waitFor(() => getNotificationDiagnostics().length === 2)
		expect(inApp.handled.map((h) => h.id)).toEqual(["n1", "n2"])
	})

	it("suppresses native notifications when focused", async () => {
		const inApp = new RecordingSink("in-app")
		const sound = new RecordingSink("sound")
		const native = new RecordingSink("native")
		const orchestrator = new NotificationOrchestrator()

		orchestrator.setDependencies({
			getContext: () => ({
				currentChannelId: "channel-1",
				sessionStartTime: new Date("2024-01-01T00:00:00Z"),
				isMuted: false,
				isWindowFocused: true,
				visibilityState: "visible",
				now: Date.now(),
			}),
			inAppSink: inApp,
			soundSink: sound,
			nativeSink: native,
		})

		orchestrator.enqueue([createEvent("n1", "2025-01-01T10:00:01Z", "channel-2")])
		await waitFor(() => getNotificationDiagnostics().length === 1)

		const record = getNotificationDiagnostics()[0]
		expect(record?.decision.sendNative).toBe(false)
		expect(record?.decision.playSound).toBe(true)
	})

	it("deduplicates repeated events", async () => {
		const inApp = new RecordingSink("in-app")
		const sound = new RecordingSink("sound")
		const native = new RecordingSink("native")
		const orchestrator = new NotificationOrchestrator()

		orchestrator.setDependencies({
			getContext: () => ({
				currentChannelId: null,
				sessionStartTime: new Date("2024-01-01T00:00:00Z"),
				isMuted: false,
				isWindowFocused: false,
				visibilityState: "hidden",
				now: Date.now(),
			}),
			inAppSink: inApp,
			soundSink: sound,
			nativeSink: native,
		})

		const event = createEvent("n1", "2025-01-01T10:00:01Z")
		orchestrator.enqueue([event])
		orchestrator.enqueue([event])

		await waitFor(() => getNotificationDiagnostics().length === 1)
		expect(inApp.handled.length).toBe(1)
	})
})
