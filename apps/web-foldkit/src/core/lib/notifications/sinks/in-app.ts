import type {
	NotificationDecision,
	NotificationEvent,
	NotificationSink,
	NotificationSinkResult,
} from "../types"

/**
 * In-app notifications are backed by synced DB state; this sink intentionally
 * acts as a no-op marker so the orchestrator still tracks it uniformly.
 */
export class InAppNotificationSink implements NotificationSink {
	async handle(
		_event: NotificationEvent,
		_decision: NotificationDecision,
	): Promise<NotificationSinkResult> {
		return {
			sink: "in-app",
			status: "sent",
			reason: "ok",
		}
	}
}

export const inAppNotificationSink = new InAppNotificationSink()
