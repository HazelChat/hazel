import type { NotificationProcessingRecord } from "./types"

const MAX_RECORDS = 200
const records: NotificationProcessingRecord[] = []
const listeners = new Set<() => void>()

const emit = () => {
	for (const listener of listeners) {
		listener()
	}
}

export const pushNotificationDiagnostics = (record: NotificationProcessingRecord) => {
	records.unshift(record)
	if (records.length > MAX_RECORDS) {
		records.length = MAX_RECORDS
	}
	emit()
}

export const getNotificationDiagnostics = () => records

export const clearNotificationDiagnostics = () => {
	records.length = 0
	emit()
}

export const subscribeNotificationDiagnostics = (listener: () => void) => {
	listeners.add(listener)
	return () => {
		listeners.delete(listener)
	}
}
