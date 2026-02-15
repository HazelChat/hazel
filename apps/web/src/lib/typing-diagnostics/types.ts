export type TypingDiagnosticsEventKind =
	| "start_requested"
	| "heartbeat_sent"
	| "stop_requested"
	| "rpc_upsert_success"
	| "rpc_upsert_failure"
	| "rpc_delete_success"
	| "rpc_delete_failure"
	| "collection_state"

export interface TypingDiagnosticsEvent {
	id: string
	at: number
	kind: TypingDiagnosticsEventKind
	channelId?: string
	memberId?: string | null
	typingIndicatorId?: string | null
	details?: Record<string, unknown>
}
