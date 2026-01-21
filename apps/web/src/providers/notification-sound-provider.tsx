import { useAtomValue } from "@effect-atom/atom-react"
import { eq, useLiveQuery } from "@tanstack/react-db"
import { type ReactNode, useEffect, useRef } from "react"
import {
	createIsMutedGetter,
	notificationSoundSettingsAtom,
	sessionStartTimeAtom,
} from "~/atoms/notification-sound-atoms"
import { notificationCollection, organizationMemberCollection, userCollection } from "~/db/collections"
import { currentChannelIdAtom } from "~/hooks/use-presence"
import { useAuth } from "~/lib/auth"
import { sendNativeNotification } from "~/lib/native-notifications"
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
	// without causing re-subscriptions
	const settingsRef = useRef(settings)
	const doNotDisturbRef = useRef(doNotDisturb)
	const quietHoursStartRef = useRef(quietHoursStart)
	const quietHoursEndRef = useRef(quietHoursEnd)
	const sessionStartTimeRef = useRef(sessionStartTime)
	const currentChannelIdRef = useRef(currentChannelId)

	// Update refs when values change
	useEffect(() => {
		settingsRef.current = settings
	}, [settings])
	useEffect(() => {
		doNotDisturbRef.current = doNotDisturb
	}, [doNotDisturb])
	useEffect(() => {
		quietHoursStartRef.current = quietHoursStart
	}, [quietHoursStart])
	useEffect(() => {
		quietHoursEndRef.current = quietHoursEnd
	}, [quietHoursEnd])
	useEffect(() => {
		sessionStartTimeRef.current = sessionStartTime
	}, [sessionStartTime])
	useEffect(() => {
		currentChannelIdRef.current = currentChannelId
	}, [currentChannelId])

	// Initialize manager dependencies once on mount
	useEffect(() => {
		// Initialize priming (for browser autoplay)
		const cleanupPriming = notificationSoundManager.initPriming()

		// Set up dependencies using refs for latest values
		notificationSoundManager.setDependencies({
			getCurrentChannelId: () => currentChannelIdRef.current,
			getSessionStartTime: () => sessionStartTimeRef.current,
			getIsMuted: createIsMutedGetter(
				settingsRef.current,
				doNotDisturbRef.current,
				quietHoursStartRef.current,
				quietHoursEndRef.current,
			),
			getConfig: () => ({
				soundFile: settingsRef.current?.soundFile ?? "notification01",
				volume: settingsRef.current?.volume ?? 0.5,
				cooldownMs: settingsRef.current?.cooldownMs ?? 2000,
			}),
		})

		return cleanupPriming
	}, [])

	// Update the getIsMuted function when relevant settings change
	useEffect(() => {
		notificationSoundManager.setDependencies({
			getCurrentChannelId: () => currentChannelIdRef.current,
			getSessionStartTime: () => sessionStartTimeRef.current,
			getIsMuted: createIsMutedGetter(
				settingsRef.current,
				doNotDisturbRef.current,
				quietHoursStartRef.current,
				quietHoursEndRef.current,
			),
			getConfig: () => ({
				soundFile: settingsRef.current?.soundFile ?? "notification01",
				volume: settingsRef.current?.volume ?? 0.5,
				cooldownMs: settingsRef.current?.cooldownMs ?? 2000,
			}),
		})
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

		// Send native notification (has its own focus check)
		sendNativeNotification("Hazel", "You have a new notification")
	}, [latestNotification])

	return <>{children}</>
}
