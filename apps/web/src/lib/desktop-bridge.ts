import type { DesktopRuntimeRpcSchema, DesktopUpdaterStatusEntry } from "@hazel/domain/desktop-runtime-rpc"
import { isDesktopRuntime } from "./desktop-runtime"

type BunRequests = DesktopRuntimeRpcSchema["bun"]["requests"]
type WebviewMessages = DesktopRuntimeRpcSchema["webview"]["messages"]

type MessageHandler<Name extends keyof WebviewMessages> = (payload: WebviewMessages[Name]) => void

const messageHandlers: {
	[Name in keyof WebviewMessages]: Set<MessageHandler<Name>>
} = {
	"oauth.callback": new Set(),
	"menu.action": new Set(),
	"updater.status": new Set(),
}

type DesktopRpc = {
	request: {
		[Name in keyof BunRequests]: (
			params: BunRequests[Name]["params"],
		) => Promise<BunRequests[Name]["response"]>
	}
}

let bridgePromise: Promise<{ rpc: DesktopRpc } | null> | null = null

const emitMessage = <Name extends keyof WebviewMessages>(name: Name, payload: WebviewMessages[Name]) => {
	for (const handler of messageHandlers[name] as Set<MessageHandler<Name>>) {
		handler(payload)
	}
}

const getBridge = async (): Promise<{ rpc: DesktopRpc } | null> => {
	if (!isDesktopRuntime()) return null

	if (!bridgePromise) {
		bridgePromise = (async () => {
			const { Electroview } = await import("electrobun/view")
			const defineRPC = (Electroview as unknown as { defineRPC: (config: unknown) => unknown }).defineRPC
			const rpc = defineRPC({
				handlers: {
					requests: {},
					messages: {
						"oauth.callback": (payload: unknown) =>
							emitMessage("oauth.callback", payload as WebviewMessages["oauth.callback"]),
						"menu.action": (payload: unknown) =>
							emitMessage("menu.action", payload as WebviewMessages["menu.action"]),
						"updater.status": (payload: unknown) =>
							emitMessage("updater.status", payload as WebviewMessages["updater.status"]),
					},
				},
			}) as unknown as DesktopRpc

			new Electroview({ rpc: rpc as never })
			return { rpc }
		})().catch((error) => {
			console.error("[desktop-bridge] Failed to initialize bridge:", error)
			return null
		})
	}

	return bridgePromise
}

const request = async <Name extends keyof BunRequests>(
	name: Name,
	params: BunRequests[Name]["params"],
): Promise<BunRequests[Name]["response"]> => {
	const bridge = await getBridge()
	if (!bridge) throw new Error("Desktop runtime bridge not available")
	return bridge.rpc.request[name](params)
}

export const onDesktopMessage = <Name extends keyof WebviewMessages>(
	name: Name,
	handler: MessageHandler<Name>,
): (() => void) => {
	messageHandlers[name].add(handler as never)
	return () => {
		messageHandlers[name].delete(handler as never)
	}
}

export const desktopBridge = {
	isAvailable: isDesktopRuntime,
	ensureReady: getBridge,
	startOAuthServer: () => request("oauth.startServer", undefined),
	openExternal: (url: string) => request("shell.openExternal", { url }),
	getVersion: () => request("app.getVersion", undefined),
	storeGet: (name: string, key: string) => request("store.get", { name, key }),
	storeSet: (name: string, key: string, value: string) => request("store.set", { name, key, value }),
	storeDelete: (name: string, key: string) => request("store.delete", { name, key }),
	storeClear: (name: string) => request("store.clear", { name }),
	storeLength: (name: string) => request("store.length", { name }),
	updaterCheck: () => request("updater.check", undefined),
	updaterDownload: () => request("updater.download", undefined),
	updaterApply: () => request("updater.apply", undefined),
	updaterGetStatus: () => request("updater.getStatus", undefined),
	showNotification: (options: { title: string; body?: string; subtitle?: string; silent?: boolean }) =>
		request("notifications.show", options),
}

export type DesktopMenuAction = WebviewMessages["menu.action"]
export type DesktopUpdaterStatus = DesktopUpdaterStatusEntry
