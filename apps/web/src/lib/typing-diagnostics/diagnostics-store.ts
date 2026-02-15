import type { TypingDiagnosticsEvent } from "./types"

const MAX_RECORDS = 300
const records: TypingDiagnosticsEvent[] = []
const listeners = new Set<() => void>()

const emit = () => {
	for (const listener of listeners) {
		listener()
	}
}

export const pushTypingDiagnostics = (event: Omit<TypingDiagnosticsEvent, "id" | "at">) => {
	const record: TypingDiagnosticsEvent = {
		id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
		at: Date.now(),
		...event,
	}

	records.unshift(record)
	if (records.length > MAX_RECORDS) {
		records.length = MAX_RECORDS
	}
	emit()
}

export const getTypingDiagnostics = () => records

export const clearTypingDiagnostics = () => {
	records.length = 0
	emit()
}

export const subscribeTypingDiagnostics = (listener: () => void) => {
	listeners.add(listener)
	return () => {
		listeners.delete(listener)
	}
}
