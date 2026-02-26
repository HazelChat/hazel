/**
 * @module Native notification handling
 * @platform desktop
 * @description Send system-level notifications via desktop runtime bridge
 */

import type { Channel, Message, User } from "@hazel/domain/models"
import { desktopBridge } from "./desktop-bridge"
import { isDesktopRuntime } from "./desktop-runtime"

let permissionGrantedCache: boolean | null = null

const getPermission = async (requestIfMissing: boolean): Promise<boolean> => {
	if (!isDesktopRuntime()) {
		return false
	}

	if (permissionGrantedCache === true) {
		return true
	}

	if (requestIfMissing) {
		permissionGrantedCache = true
		return true
	}

	permissionGrantedCache = true
	return true
}

export type NativeNotificationReason =
	| "ok"
	| "permission_denied"
	| "api_unavailable"
	| "focused_window"
	| "error"

export interface NativeNotificationResult {
	status: "sent" | "suppressed" | "failed"
	reason: NativeNotificationReason
	error?: unknown
}

export async function getNativeNotificationPermissionState(): Promise<"granted" | "denied" | "unavailable"> {
	if (!isDesktopRuntime()) {
		return "unavailable"
	}

	const granted = await getPermission(false)
	return granted ? "granted" : "denied"
}

export async function initNativeNotifications(): Promise<boolean> {
	return getPermission(true)
}

export async function testNativeNotification(): Promise<boolean> {
	if (!isDesktopRuntime()) return false

	const granted = await getPermission(true)
	if (!granted) {
		return false
	}

	try {
		const result = await desktopBridge.showNotification({
			title: "Jane Smith in #general",
			body: "Hey! This is what your notifications will look like.",
			subtitle: "Hazel",
		})
		return result.ok
	} catch (error) {
		console.error("[native-notifications] Test notification failed:", error)
		return false
	}
}

export interface NativeNotificationOptions {
	title: string
	body: string
	largeBody?: string
	group?: string
}

export async function sendNativeNotification(
	options: NativeNotificationOptions,
): Promise<NativeNotificationResult> {
	if (typeof document !== "undefined" && document.hasFocus()) {
		return {
			status: "suppressed",
			reason: "focused_window",
		}
	}

	if (!isDesktopRuntime()) {
		return {
			status: "suppressed",
			reason: "api_unavailable",
		}
	}

	const granted = await getPermission(false)
	if (!granted) {
		return {
			status: "suppressed",
			reason: "permission_denied",
		}
	}

	try {
		const result = await desktopBridge.showNotification({
			title: options.title,
			body: options.largeBody ?? options.body,
			subtitle: "Hazel",
		})
		if (!result.ok) {
			return {
				status: "failed",
				reason: "error",
				error: new Error("Desktop bridge notification call failed"),
			}
		}
		return {
			status: "sent",
			reason: "ok",
		}
	} catch (error) {
		console.error("[native-notifications] Failed to send notification:", error)
		return {
			status: "failed",
			reason: "error",
			error,
		}
	}
}

export function truncateText(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text
	return `${text.slice(0, maxLength)}...`
}

export function getMessagePreview(content: string | null | undefined, maxLength = 100): string {
	if (!content) return "Sent a message"

	const plainText = content.replace(/[*_`~#]/g, "").trim()

	return truncateText(plainText, maxLength)
}

export function formatAuthorName(user: typeof User.Model.Type | undefined): string {
	if (!user) return "Someone"
	return `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Someone"
}

export function formatNotificationTitle(
	author: typeof User.Model.Type | undefined,
	channel: typeof Channel.Model.Type | undefined,
): string {
	const authorName = formatAuthorName(author)

	if (!channel) return authorName

	if (channel.type === "direct" || channel.type === "single") {
		return authorName
	}

	return `${authorName} in #${channel.name}`
}

export function buildNotificationContent(
	message: typeof Message.Model.Type | undefined,
	author: typeof User.Model.Type | undefined,
	channel: typeof Channel.Model.Type | undefined,
): NativeNotificationOptions {
	const title = formatNotificationTitle(author, channel)
	const body = getMessagePreview(message?.content)
	const largeBody = message?.content ? getMessagePreview(message.content, 300) : undefined

	return {
		title,
		body,
		largeBody,
		group: channel?.id,
	}
}
