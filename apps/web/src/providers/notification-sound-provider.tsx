import type { ChannelId, MessageId } from "@hazel/schema"
import { useAtomValue } from "@effect/atom-react"
import { eq, useLiveQuery } from "@tanstack/react-db"
import { type ReactNode, useEffect, useMemo, useRef } from "react"
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
import {
	inAppNotificationSink,
	NativeNotificationSink,
	notificationOrchestrator,
	SoundNotificationSink,
	type NotificationEvent,
} from "~/lib/notifications"
import { notificationSoundManager } from "~/lib/notification-sound-manager"

interface NotificationSoundProviderProps {
	children: ReactNode
}

const MAX_RECENT_NOTIFICATIONS = 250

export function NotificationSoundProvider({ children }: NotificationSoundProviderProps) {
	const { user } = useAuth()

	const settings = useAtomValue(notificationSoundSettingsAtom)
	const sessionStartTime = useAtomValue(sessionStartTimeAtom)
	const currentChannelId = useAtomValue(currentChannelIdAtom)

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

	const doNotDisturb = userData?.settings?.doNotDisturb ?? false
	const quietHoursStart = userData?.settings?.quietHoursStart ?? "22:00"
	const quietHoursEnd = userData?.settings?.quietHoursEnd ?? "08:00"

	const { data: member } = useLiveQuery(
		(q) =>
			q
				.from({ member: organizationMemberCollection })
				.where(({ member }) => eq(member.userId, user?.id))
				.findOne(),
		[user?.id],
	)

	const { data: recentNotifications } = useLiveQuery(
		(q) =>
			member?.id
				? q
						.from({ notification: notificationCollection })
						.where(({ notification }) => eq(notification.memberId, member.id))
						.orderBy(({ notification }) => notification.createdAt, "desc")
						.limit(MAX_RECENT_NOTIFICATIONS)
				: null,
		[member?.id],
	)

	const latestValuesRef = useRef({
		settings,
		doNotDisturb,
		quietHoursStart,
		quietHoursEnd,
		sessionStartTime,
		currentChannelId,
	})

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

	const soundSink = useMemo(() => new SoundNotificationSink({ notificationSoundManager }), [])
	const nativeSink = useMemo(() => new NativeNotificationSink(), [])

	useEffect(() => {
		const cleanupPriming = notificationSoundManager.initPriming()
		notificationSoundManager.setDependencies({
			getConfig: () => ({
				soundFile: latestValuesRef.current.settings?.soundFile ?? "notification01",
				volume: latestValuesRef.current.settings?.volume ?? 0.5,
				cooldownMs: latestValuesRef.current.settings?.cooldownMs ?? 1000,
			}),
		})

		return cleanupPriming
	}, [])

	useEffect(() => {
		notificationSoundManager.setDependencies({
			getConfig: () => ({
				soundFile: latestValuesRef.current.settings?.soundFile ?? "notification01",
				volume: latestValuesRef.current.settings?.volume ?? 0.5,
				cooldownMs: latestValuesRef.current.settings?.cooldownMs ?? 1000,
			}),
		})
	}, [settings])

	useEffect(() => {
		notificationOrchestrator.setDependencies({
			getContext: () => {
				const latest = latestValuesRef.current
				return {
					currentChannelId: latest.currentChannelId,
					sessionStartTime: latest.sessionStartTime,
					isMuted: createIsMutedGetter(
						latest.settings,
						latest.doNotDisturb,
						latest.quietHoursStart,
						latest.quietHoursEnd,
					)(),
					isWindowFocused: typeof document !== "undefined" ? document.hasFocus() : false,
					visibilityState: typeof document !== "undefined" ? document.visibilityState : "hidden",
					now: Date.now(),
				}
			},
			inAppSink: inAppNotificationSink,
			soundSink,
			nativeSink,
		})
	}, [
		soundSink,
		nativeSink,
		settings,
		doNotDisturb,
		quietHoursStart,
		quietHoursEnd,
		sessionStartTime,
		currentChannelId,
	])

	useEffect(() => {
		if (!recentNotifications || recentNotifications.length === 0) {
			return
		}

		const events: NotificationEvent[] = [...recentNotifications].reverse().map((notification) => {
			const messageId = notification.resourceId as MessageId | null
			const channelId = notification.targetedResourceId as ChannelId | null

			const message = messageId ? messageCollection.state.get(messageId) : undefined
			const author = message?.authorId ? userCollection.state.get(message.authorId) : undefined
			const channel = channelId ? channelCollection.state.get(channelId) : undefined

			return {
				id: notification.id,
				notification,
				message,
				author,
				channel,
				receivedAt: Date.now(),
			}
		})

		notificationOrchestrator.enqueue(events)
	}, [recentNotifications])

	return <>{children}</>
}
