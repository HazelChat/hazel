/**
 * @module Native notification handling
 * @platform desktop
 * @description Send system-level notifications via Tauri notification plugin
 */

import type { Channel, Message, User } from "@hazel/domain/models"

type NotificationApi = typeof import("@tauri-apps/plugin-notification")

const notification: NotificationApi | undefined = (window as any).__TAURI__?.notification

export async function initNativeNotifications(): Promise<boolean> {
	if (!notification) return false

	let granted = await notification.isPermissionGranted()
	if (!granted) {
		const permission = await notification.requestPermission()
		granted = permission === "granted"
	}
	return granted
}

/**
 * Send a test notification (bypasses focus check for testing)
 * @returns true if notification was sent, false if not available/permitted
 */
export async function testNativeNotification(): Promise<boolean> {
	if (!notification) return false

	const granted = await notification.isPermissionGranted()
	if (!granted) {
		const permission = await notification.requestPermission()
		if (permission !== "granted") return false
	}

	try {
		notification.sendNotification({
			title: "Jane Smith in #general",
			body: "Hey! This is what your notifications will look like.",
			largeBody:
				"Hey! This is what your notifications will look like. You can customize sounds and quiet hours in the settings above.",
		})
		return true
	} catch (error) {
		console.error("[native-notifications] Test notification failed:", error)
		return false
	}
}

/**
 * Options for rich native notifications
 */
export interface NativeNotificationOptions {
	/** Notification title - author name or "Author in #channel" */
	title: string
	/** Message preview (truncated) */
	body: string
	/** Longer preview for expanded view */
	largeBody?: string
	/** Channel ID for grouping notifications */
	group?: string
}

/**
 * Send a native notification with rich content
 */
export async function sendNativeNotification(options: NativeNotificationOptions) {
	if (document.hasFocus()) return
	if (!notification) return

	const granted = await notification.isPermissionGranted()
	if (!granted) return

	try {
		notification.sendNotification({
			title: options.title,
			body: options.body,
			largeBody: options.largeBody,
			group: options.group,
		})
	} catch (error) {
		console.error("[native-notifications] Failed to send notification:", error)
	}
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text
	return `${text.slice(0, maxLength)}...`
}

/**
 * Get a plain text preview from message content, stripping markdown
 */
export function getMessagePreview(content: string | null | undefined, maxLength = 100): string {
	if (!content) return "Sent a message"

	// Strip markdown characters for clean preview
	const plainText = content.replace(/[*_`~#]/g, "").trim()

	return truncateText(plainText, maxLength)
}

/**
 * Format author display name
 */
export function formatAuthorName(user: typeof User.Model.Type | undefined): string {
	if (!user) return "Someone"
	return `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Someone"
}

/**
 * Format notification title based on channel type
 * - DM/single: Just author name ("John Doe")
 * - Channel/thread: Author + channel ("John Doe in #general")
 */
export function formatNotificationTitle(
	author: typeof User.Model.Type | undefined,
	channel: typeof Channel.Model.Type | undefined,
): string {
	const authorName = formatAuthorName(author)

	if (!channel) return authorName

	// For direct/single channels, just show author name
	if (channel.type === "direct" || channel.type === "single") {
		return authorName
	}

	// For public/private channels and threads, show "Author in #channel"
	return `${authorName} in #${channel.name}`
}

/**
 * Build complete notification content from message, author, and channel data
 */
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
