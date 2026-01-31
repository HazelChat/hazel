import type { ChannelId, MessageId } from "@hazel/schema"
import { useAtomValue } from "@effect-atom/atom-react"
import { eq, useLiveQuery } from "@tanstack/react-db"
import { type ReactNode, useEffect, useRef } from "react"
import {
	createIsMutedGetter,
	notificationSoundSettingsAtom,
	sessionStartTimeAtom,
} from "~/atoms/notification-sound-atoms"
import {
	channelCollection,
	messageCollection,
	notificationCollection,
	organizationMemberCollection,
	userCollection,
} from "~/db/collections"
import { currentChannelIdAtom } from "~/hooks/use-presence"
import { useAuth } from "~/lib/auth"
import { buildNotificationContent, sendNativeNotification } from "~/lib/native-notifications"
import { notificationSoundManager } from "~/lib/notification-sound-manager"

interface NotificationSoundProviderProps {
	children: ReactNode
}

export function NotificationSoundProvider({ children }: NotificationSoundProviderProps) {
	const { user } = useAuth()

	// Get reactive values from atoms
	const settings = useAtomValue(notificationSoundSettingsAtom)
	const sessionStartTime = useAtomValue(sessionStartTimeAtom)
	const currentChannelId = useAtomValue(currentChannelIdAtom)

	// Read user settings from userCollection (TanStack DB) - auto-updates on collection change
	const { data: userData } = useLiveQuery(
		(q) =>
			user?.id
				? q
						.from({ u: userCollection })
						.where(({ u }) => eq(u.id, user.id))
						.findOne()
				: null,
		[user?.id],
	)

	// Derive notification settings from userData
	const doNotDisturb = userData?.settings?.doNotDisturb ?? false
	const quietHoursStart = userData?.settings?.quietHoursStart ?? "22:00"
	const quietHoursEnd = userData?.settings?.quietHoursEnd ?? "08:00"

	// Get current member
	const { data: member } = useLiveQuery(
		(q) =>
			q
				.from({ member: organizationMemberCollection })
				.where(({ member }) => eq(member.userId, user?.id))
				.findOne(),
		[user?.id],
	)

	// Subscribe to latest notification for current member
	const { data: latestNotification } = useLiveQuery(
		(q) =>
			q
				.from({ notification: notificationCollection })
				.where(({ notification }) => eq(notification.memberId, member?.id))
				.orderBy(({ notification }) => notification.createdAt, "desc")
				.findOne(),
		[member?.id],
	)

	// Track last processed notification to detect new ones
	const lastProcessedIdRef = useRef<string | null>(null)

	// Use refs for reactive values so manager always has current values
	// without causing re-subscriptions. We use a single ref object to avoid
	// multiple useEffect calls for syncing individual values.
	const latestValuesRef = useRef({
		settings,
		doNotDisturb,
		quietHoursStart,
		quietHoursEnd,
		sessionStartTime,
		currentChannelId,
	})

	// Sync all values in a single effect - this is equivalent to assigning directly
	// but ensures the ref always has the latest values for use in callbacks
	useEffect(() => {
		latestValuesRef.current = {
			settings,
			doNotDisturb,
			quietHoursStart,
			quietHoursEnd,
			sessionStartTime,
			currentChannelId,
		}
	}, [settings, doNotDisturb, quietHoursStart, quietHoursEnd, sessionStartTime, currentChannelId])

	// Helper to create dependencies from latest values ref
	const createDependencies = () => {
		const v = latestValuesRef.current
		return {
			getCurrentChannelId: () => latestValuesRef.current.currentChannelId,
			getSessionStartTime: () => latestValuesRef.current.sessionStartTime,
			getIsMuted: createIsMutedGetter(v.settings, v.doNotDisturb, v.quietHoursStart, v.quietHoursEnd),
			getConfig: () => ({
				soundFile: latestValuesRef.current.settings?.soundFile ?? "notification01",
				volume: latestValuesRef.current.settings?.volume ?? 0.5,
				cooldownMs: latestValuesRef.current.settings?.cooldownMs ?? 2000,
			}),
		}
	}

	// Initialize manager dependencies once on mount
	useEffect(() => {
		// Initialize priming (for browser autoplay)
		const cleanupPriming = notificationSoundManager.initPriming()

		// Set up dependencies using refs for latest values
		notificationSoundManager.setDependencies(createDependencies())

		return cleanupPriming
	}, [])

	// Update the getIsMuted function when relevant settings change
	useEffect(() => {
		notificationSoundManager.setDependencies(createDependencies())
	}, [settings, doNotDisturb, quietHoursStart, quietHoursEnd])

	// Process new notifications
	useEffect(() => {
		if (!latestNotification) {
			return
		}

		// Skip if we've already processed this notification
		if (latestNotification.id === lastProcessedIdRef.current) {
			return
		}

		lastProcessedIdRef.current = latestNotification.id

		// Play sound via manager (handles all suppression logic)
		notificationSoundManager.playSound({
			notificationId: latestNotification.id,
			channelId: latestNotification.targetedResourceId,
			createdAt: latestNotification.createdAt,
		})

		// Send native notification with rich content
		try {
			const messageId = latestNotification.resourceId as MessageId | null
			const channelId = latestNotification.targetedResourceId as ChannelId | null

			// Synchronous lookups from local TanStack DB collections
			const message = messageId ? messageCollection.state.get(messageId) : undefined
			const author = message?.authorId ? userCollection.state.get(message.authorId) : undefined
			const channel = channelId ? channelCollection.state.get(channelId) : undefined

			const content = buildNotificationContent(message, author, channel)
			sendNativeNotification(content)
		} catch (error) {
			// Fallback to generic notification on any error
			console.error("[notification-sound-provider] Failed to build rich notification:", error)
			sendNativeNotification({ title: "Hazel", body: "You have a new notification" })
		}
	}, [latestNotification])

	return <>{children}</>
}
