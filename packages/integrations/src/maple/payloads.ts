/**
 * Maple alert webhook payload types.
 * These match Maple's buildPayload() output (apps/api/src/services/AlertsService.ts in maple repo).
 */

export type MapleEventType = "trigger" | "resolve" | "renotify" | "test"
export type MapleIncidentStatus = "open" | "resolved"
export type MapleSeverity = "warning" | "critical"
export type MapleComparator = "gt" | "gte" | "lt" | "lte"
export type MapleSignalType =
	| "error_rate"
	| "p95_latency"
	| "p99_latency"
	| "apdex"
	| "throughput"
	| "metric"
	| "query"

export interface MapleAlertRule {
	id: string
	name: string
	signalType: MapleSignalType
	severity: MapleSeverity
	groupKey: string | null
	comparator: MapleComparator
	threshold: number
	windowMinutes: number
}

export interface MapleObserved {
	value: number | null
	sampleCount: number | null
}

export interface MapleAlertPayload {
	eventType: MapleEventType
	incidentId: string | null
	incidentStatus: MapleIncidentStatus
	dedupeKey: string
	rule: MapleAlertRule
	observed: MapleObserved
	linkUrl: string
	chatUrl: string
	sentAt: string
}
