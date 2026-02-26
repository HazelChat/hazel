export type DesktopUpdaterStatusEntry = {
	status: string
	message: string
	timestamp: number
	details?: Record<string, unknown>
}

export interface DesktopRuntimeRpcSchema {
	bun: {
		requests: {
			"oauth.startServer": {
				params: undefined
				response: { port: number; nonce: string }
			}
			"shell.openExternal": {
				params: { url: string }
				response: { ok: boolean }
			}
			"app.getVersion": {
				params: undefined
				response: { version: string }
			}
			"store.get": {
				params: { name: string; key: string }
				response: { value: string | null }
			}
			"store.set": {
				params: { name: string; key: string; value: string }
				response: { ok: boolean }
			}
			"store.delete": {
				params: { name: string; key: string }
				response: { ok: boolean }
			}
			"store.clear": {
				params: { name: string }
				response: { ok: boolean }
			}
			"store.length": {
				params: { name: string }
				response: { value: number }
			}
			"updater.check": {
				params: undefined
				response: {
					version: string
					hash: string
					updateAvailable: boolean
					updateReady: boolean
					error: string
				}
			}
			"updater.download": {
				params: undefined
				response: { ok: boolean; error?: string }
			}
			"updater.apply": {
				params: undefined
				response: { ok: boolean; error?: string }
			}
			"updater.getStatus": {
				params: undefined
				response: { entries: ReadonlyArray<DesktopUpdaterStatusEntry> }
			}
			"notifications.show": {
				params: { title: string; body?: string; subtitle?: string; silent?: boolean }
				response: { ok: boolean }
			}
		}
		messages: {}
	}
	webview: {
		requests: {}
		messages: {
			"oauth.callback": { url: string }
			"menu.action": { action: "settings" | "check_updates" | "new_channel" | "invite"; data?: unknown }
			"updater.status": DesktopUpdaterStatusEntry
		}
	}
}
