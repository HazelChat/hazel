import { isTauri } from "./tauri"

let notificationApi: typeof import("@tauri-apps/plugin-notification") | null = null

async function getNotificationApi() {
	if (!isTauri()) return null
	if (!notificationApi) {
		notificationApi = await import("@tauri-apps/plugin-notification")
	}
	return notificationApi
}

export async function initNativeNotifications(): Promise<boolean> {
	const api = await getNotificationApi()
	if (!api) return false

	let granted = await api.isPermissionGranted()
	if (!granted) {
		const permission = await api.requestPermission()
		granted = permission === "granted"
	}
	return granted
}

export async function sendNativeNotification(title: string, body: string) {
	if (document.hasFocus()) return

	const api = await getNotificationApi()
	if (!api) return

	const granted = await api.isPermissionGranted()
	if (granted) {
		api.sendNotification({ title, body })
	}
}
