import { mkdirSync } from "node:fs"
import { join } from "node:path"
import type { DesktopRuntimeRpcSchema, DesktopUpdaterStatusEntry } from "@hazel/domain/desktop-runtime-rpc"
import Electrobun, {
	ApplicationMenu,
	BrowserView,
	BrowserWindow,
	Updater,
	Utils,
	type UpdateStatusEntry,
} from "electrobun"

const OAUTH_PORT_MIN = 17900
const OAUTH_PORT_MAX = 17999

const activeNonces = new Map<number, string>()
const activeServers = new Map<number, Bun.Server<unknown>>()

let mainWindow: BrowserWindow | null = null

const APP_VERSION = "0.1.7"
const STORE_DIR = join(Utils.paths.userData, "store")

type WebviewMessages = DesktopRuntimeRpcSchema["webview"]["messages"]
type MenuAction = WebviewMessages["menu.action"]["action"]
type BunRequests = DesktopRuntimeRpcSchema["bun"]["requests"]

const menuActions = new Set<MenuAction>(["settings", "check_updates", "new_channel", "invite"])

const ensureStoreDir = () => {
	mkdirSync(STORE_DIR, { recursive: true })
}

const normalizeStoreName = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, "_")

const getStorePath = (name: string) => join(STORE_DIR, normalizeStoreName(name))

const loadStore = async (name: string): Promise<Record<string, string>> => {
	const path = getStorePath(name)
	const file = Bun.file(path)

	if (!(await file.exists())) return {}

	try {
		const json = await file.json()
		if (json && typeof json === "object") {
			return Object.fromEntries(
				Object.entries(json as Record<string, unknown>).flatMap(([key, value]) =>
					typeof value === "string" ? [[key, value]] : [],
				),
			)
		}
		return {}
	} catch {
		return {}
	}
}

const saveStore = async (name: string, store: Record<string, string>): Promise<void> => {
	const path = getStorePath(name)
	await Bun.write(path, JSON.stringify(store, null, 2))
}

const buildCorsHeaders = () =>
	new Headers({
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type",
		"Content-Type": "application/json",
		Connection: "close",
	})

const randomNonce = () => `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`

const toDesktopUpdaterStatusEntry = (entry: UpdateStatusEntry): DesktopUpdaterStatusEntry => ({
	status: entry.status,
	message: entry.message,
	timestamp: entry.timestamp,
	details:
		entry.details && typeof entry.details === "object"
			? (entry.details as Record<string, unknown>)
			: undefined,
})

const emitToWebview = <Name extends keyof WebviewMessages>(name: Name, payload: WebviewMessages[Name]) => {
	try {
		if (!mainWindow?.webview?.rpc) return
		const rpc = mainWindow.webview.rpc as unknown as {
			send?: { [Key in keyof WebviewMessages]: (value: WebviewMessages[Key]) => void }
			proxy?: { send?: { [Key in keyof WebviewMessages]: (value: WebviewMessages[Key]) => void } }
		}
		const sender = rpc.send?.[name] ?? rpc.proxy?.send?.[name]
		sender?.(payload)
	} catch (error) {
		console.error(`[desktop-runtime] Failed to emit "${String(name)}":`, error)
	}
}

const stopOAuthServer = (port: number) => {
	const server = activeServers.get(port)
	if (server) {
		try {
			server.stop(true)
		} catch {}
		activeServers.delete(port)
	}
	activeNonces.delete(port)
}

const startOAuthServer = async (): Promise<{ port: number; nonce: string }> => {
	for (let port = OAUTH_PORT_MIN; port <= OAUTH_PORT_MAX; port++) {
		try {
			const nonce = randomNonce()

				const server = Bun.serve({
					hostname: "127.0.0.1",
					port,
					fetch: async (request: Request) => {
					const headers = buildCorsHeaders()

					if (request.method === "OPTIONS") {
						return new Response(null, {
							status: 204,
							headers,
						})
					}

					if (request.method !== "POST") {
						return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers })
					}

					let body: unknown
					try {
						body = await request.json()
					} catch {
						return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers })
					}

					const parsed = body as { code?: unknown; nonce?: unknown; state?: unknown }
					const code = typeof parsed.code === "string" ? parsed.code : null
					const requestNonce = typeof parsed.nonce === "string" ? parsed.nonce : null
					const state = typeof parsed.state === "string" ? parsed.state : null

					const expectedNonce = activeNonces.get(port)
					if (!code || !requestNonce || !state || !expectedNonce) {
						return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400, headers })
					}

					if (requestNonce !== expectedNonce) {
						return new Response(JSON.stringify({ error: "Invalid nonce" }), { status: 403, headers })
					}

					const callbackUrl = `http://localhost:${port}?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`
					emitToWebview("oauth.callback", { url: callbackUrl })
					stopOAuthServer(port)
					return new Response(JSON.stringify({ success: true }), { status: 200, headers })
				},
			})

			activeNonces.set(port, nonce)
			activeServers.set(port, server)
			return { port, nonce }
		} catch {}
	}

	throw new Error("No available ports in range 17900-17999")
}

const desktopRpc = BrowserView.defineRPC<DesktopRuntimeRpcSchema>({
	handlers: {
		requests: {
			"oauth.startServer": async () => startOAuthServer(),
			"shell.openExternal": async ({ url }: BunRequests["shell.openExternal"]["params"]) => ({
				ok: Utils.openExternal(url),
			}),
			"app.getVersion": async () => ({ version: APP_VERSION }),
			"store.get": async ({ name, key }: BunRequests["store.get"]["params"]) => {
				const store = await loadStore(name)
				return { value: store[key] ?? null }
			},
			"store.set": async ({ name, key, value }: BunRequests["store.set"]["params"]) => {
				const store = await loadStore(name)
				store[key] = value
				await saveStore(name, store)
				return { ok: true }
			},
			"store.delete": async ({ name, key }: BunRequests["store.delete"]["params"]) => {
				const store = await loadStore(name)
				delete store[key]
				await saveStore(name, store)
				return { ok: true }
			},
			"store.clear": async ({ name }: BunRequests["store.clear"]["params"]) => {
				await saveStore(name, {})
				return { ok: true }
			},
			"store.length": async ({ name }: BunRequests["store.length"]["params"]) => {
				const store = await loadStore(name)
				return { value: Object.keys(store).length }
			},
			"updater.check": async () => {
				const result = await Updater.checkForUpdate()
				return {
					version: result.version ?? "",
					hash: result.hash ?? "",
					updateAvailable: !!result.updateAvailable,
					updateReady: !!result.updateReady,
					error: result.error ?? "",
				}
			},
			"updater.download": async () => {
				try {
					await Updater.downloadUpdate()
					const updateInfo = Updater.updateInfo()
					if (updateInfo.error) {
						return { ok: false, error: updateInfo.error }
					}
					return { ok: true }
				} catch (error) {
					return { ok: false, error: String(error) }
				}
			},
			"updater.apply": async () => {
				try {
					await Updater.applyUpdate()
					return { ok: true }
				} catch (error) {
					return { ok: false, error: String(error) }
				}
			},
			"updater.getStatus": async () => ({
				entries: Updater.getStatusHistory().map(toDesktopUpdaterStatusEntry),
			}),
			"notifications.show": async ({
				title,
				body,
				subtitle,
				silent,
			}: BunRequests["notifications.show"]["params"]) => {
				Utils.showNotification({ title, body, subtitle, silent })
				return { ok: true }
			},
		},
		messages: {},
	},
})

const createMainMenu = () => {
	ApplicationMenu.setApplicationMenu([
		{
			label: "Hazel",
			submenu: [
				{ label: "Settings...", action: "settings", accelerator: "CmdOrCtrl+," },
				{ label: "Check for Updates...", action: "check_updates" },
				{ type: "separator" },
				{ role: "quit" },
			],
		},
		{
			label: "File",
			submenu: [
				{ label: "New Channel...", action: "new_channel", accelerator: "CmdOrCtrl+Alt+N" },
				{ type: "separator" },
				{ label: "Invite People...", action: "invite", accelerator: "CmdOrCtrl+Alt+I" },
			],
		},
	])

	ApplicationMenu.on("application-menu-clicked", (event: unknown) => {
		const action = (event as { data?: { action?: unknown } })?.data?.action
		if (typeof action !== "string") return
		if (!menuActions.has(action as MenuAction)) return
		emitToWebview("menu.action", { action: action as MenuAction })
	})
}

	const start = () => {
	ensureStoreDir()
	Updater.clearStatusHistory()
	Updater.onStatusChange((entry) => {
		emitToWebview("updater.status", toDesktopUpdaterStatusEntry(entry))
	})

	createMainMenu()

	mainWindow = new BrowserWindow({
		title: "Hazel",
		frame: {
			x: 0,
			y: 0,
			width: 1200,
			height: 800,
		},
		url: "views://mainview/index.html",
		renderer: "native",
		titleBarStyle: "hiddenInset",
		rpc: desktopRpc,
	})

	if (Bun.env.NODE_ENV !== "production") {
		mainWindow.webview.openDevTools()
	}

	Electrobun.events.on("open-url", (event: unknown) => {
		const incomingUrl = (event as { data?: { url?: string } })?.data?.url
		if (typeof incomingUrl === "string") {
			console.log(`[desktop-runtime] Open URL event: ${incomingUrl}`)
		}
	})
}

start()
