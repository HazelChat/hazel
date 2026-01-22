import { Atom, Result, useAtomMount, useAtomSet, useAtomValue } from "@effect-atom/atom-react"
import type { ChannelId, UserId } from "@hazel/schema"
import { eq } from "@tanstack/db"
import { DateTime, Duration, Effect, Schedule, Stream } from "effect"
import { useCallback, useEffect, useMemo, useRef } from "react"
import { isInQuietHours } from "~/atoms/notification-sound-atoms"
import { userCollection, userPresenceStatusCollection } from "~/db/collections"
import { useAuth, userAtom } from "~/lib/auth"
import { HazelRpcClient } from "~/lib/services/common/rpc-atom-client"
import { runtime } from "~/lib/services/common/runtime"
import { router } from "~/main"
import { makeQuery } from "../../../../libs/tanstack-db-atom/src"

type PresenceStatus = "online" | "away" | "busy" | "dnd" | "offline"

const AFK_TIMEOUT = Duration.minutes(5)
const HEARTBEAT_INTERVAL = Duration.seconds(30)

/**
 * Atom that tracks the last user activity timestamp
 * Updates on mousemove, keydown, scroll, click, touchstart, and visibility changes
 */
const lastActivityAtom = Atom.make((get) => {
	let lastActivity = DateTime.unsafeMake(new Date())

	const handleActivity = () => {
		lastActivity = DateTime.unsafeMake(new Date())
		get.setSelf(lastActivity)
	}

	const handleVisibilityChange = () => {
		if (document.visibilityState === "visible") {
			// Reset activity timestamp when user returns to the tab
			// This ensures users are marked back online when returning to the app
			handleActivity()
		}
	}

	const events = ["mousemove", "keydown", "scroll", "click", "touchstart"]
	events.forEach((event) => {
		window.addEventListener(event, handleActivity, { passive: true })
	})

	document.addEventListener("visibilitychange", handleVisibilityChange)

	get.addFinalizer(() => {
		events.forEach((event) => {
			window.removeEventListener(event, handleActivity)
		})
		document.removeEventListener("visibilitychange", handleVisibilityChange)
	})

	return lastActivity
}).pipe(Atom.keepAlive)

/**
 * Atom for manual status updates
 * Stores the user's manually set status and custom message
 */
interface ManualStatus {
	status: PresenceStatus | null
	customMessage: string | null
	previousStatus: PresenceStatus
}

const manualStatusAtom = Atom.make<ManualStatus>({
	status: null,
	customMessage: null,
	previousStatus: "online",
}).pipe(Atom.keepAlive)

/**
 * Derived atom that determines if the user is AFK
 * Uses a Stream that checks every 10 seconds if activity timeout has been exceeded
 */
const afkStateAtom = Atom.make((get) =>
	Stream.fromSchedule(Schedule.spaced(Duration.seconds(10))).pipe(
		Stream.map(() => {
			const lastActivity = get(lastActivityAtom)
			const manualStatus = get(manualStatusAtom)
			const now = DateTime.unsafeMake(new Date())
			const timeSinceActivity = DateTime.distance(lastActivity, now)

			const isAFK =
				Duration.greaterThanOrEqualTo(timeSinceActivity, AFK_TIMEOUT) &&
				manualStatus.status !== "away"

			return {
				isAFK,
				timeSinceActivity,
				shouldMarkAway: isAFK && manualStatus.status !== "busy" && manualStatus.status !== "dnd",
			}
		}),
	),
).pipe(Atom.keepAlive)

/**
 * Derived atom that computes the final presence status
 * Combines manual status and AFK detection
 * Note: Offline status is only set on tab close or via server-side heartbeat timeout
 */
const computedPresenceStatusAtom = Atom.make((get) =>
	Effect.gen(function* () {
		const manualStatus = get(manualStatusAtom)
		const afkState = yield* get.result(afkStateAtom)

		// Manual status takes precedence
		if (manualStatus.status !== null) {
			return manualStatus.status
		}

		// Mark as away if AFK (works even when window is hidden)
		if (afkState.shouldMarkAway) {
			return "away" as PresenceStatus
		}

		// Default to online
		return "online" as PresenceStatus
	}),
)

/**
 * Atom that tracks the current route's channel ID
 * Only extracts channel ID when user is on a chat route (/$orgSlug/chat/$id)
 */
export const currentChannelIdAtom = Atom.make((get) => {
	let currentChannelId: string | null = null

	const unsubscribe = router.subscribe("onResolved", (event) => {
		// Only extract channel ID if we're on a chat route
		const pathname = event.toLocation.pathname
		const pathSegments = pathname.split("/")

		// Check if route matches /$orgSlug/chat/$id pattern
		const chatIndex = pathSegments.indexOf("chat")
		const isOnChatRoute = chatIndex !== -1 && chatIndex < pathSegments.length - 1

		const channelId = isOnChatRoute ? (pathSegments[chatIndex + 1] ?? null) : null

		if (channelId !== currentChannelId) {
			currentChannelId = channelId
			get.setSelf(channelId)
		}
	})

	get.addFinalizer(unsubscribe)

	// Get initial value from current route
	const pathname = router.state.location.pathname
	const pathSegments = pathname.split("/")
	const chatIndex = pathSegments.indexOf("chat")
	const isOnChatRoute = chatIndex !== -1 && chatIndex < pathSegments.length - 1
	currentChannelId = isOnChatRoute ? (pathSegments[chatIndex + 1] ?? null) : null

	return currentChannelId
}).pipe(Atom.keepAlive)

/**
 * Atom that manages the beforeunload event listener
 * Reads from userAtom and sends beacon to mark user offline when tab closes
 * Automatically reactive to user changes
 */
const beforeUnloadAtom = Atom.make((get) => {
	const user = Result.getOrElse(get(userAtom), () => null)

	// Skip setup if no user
	if (!user?.id) return null

	const handleBeforeUnload = () => {
		// Use sendBeacon for reliable delivery even as page unloads
		const url = `${import.meta.env.VITE_BACKEND_URL}/presence/offline`
		const blob = new Blob([JSON.stringify({ userId: user.id })], { type: "application/json" })
		navigator.sendBeacon(url, blob)
	}

	window.addEventListener("beforeunload", handleBeforeUnload)

	get.addFinalizer(() => {
		window.removeEventListener("beforeunload", handleBeforeUnload)
	})

	return user.id
})

/**
 * Atom that sends periodic heartbeat pings to the server.
 * This enables reliable offline detection - if no heartbeat is received
 * within the timeout period (90s), the server-side cron job marks the user offline.
 * This is more reliable than beforeunload which can fail on crashes, network loss, etc.
 */
const heartbeatAtom = Atom.make((get) => {
	const user = Result.getOrElse(get(userAtom), () => null)

	// Skip if no user
	if (!user?.id) return null

	// Actually run the stream as a side effect (not just return it)
	runtime.runFork(
		Stream.fromSchedule(Schedule.spaced(HEARTBEAT_INTERVAL)).pipe(
			Stream.tap(() =>
				Effect.gen(function* () {
					const client = yield* HazelRpcClient
					yield* client("userPresenceStatus.heartbeat", {})
				}).pipe(
					Effect.catchAll((error) => {
						console.error("Heartbeat failed:", error)
						return Effect.void
					}),
				),
			),
			Stream.runDrain,
		),
	)

	return user.id
}).pipe(Atom.keepAlive)

/**
 * Atom family that queries the current user's presence status from TanStack DB
 * Returns Result<PresenceData[]> that automatically updates when data changes
 */
const currentUserPresenceAtomFamily = Atom.family((userId: UserId) =>
	makeQuery((q) =>
		q
			.from({ presence: userPresenceStatusCollection })
			.where(({ presence }) => eq(presence.userId, userId))
			.orderBy(({ presence }) => presence.updatedAt, "desc")
			.findOne(),
	),
)

/**
 * Atom family that queries user settings from TanStack DB
 * Used to check quiet hours configuration for other users
 */
const userSettingsAtomFamily = Atom.family((userId: UserId) =>
	makeQuery((q) =>
		q
			.from({ user: userCollection })
			.where(({ user }) => eq(user.id, userId))
			.select(({ user }) => ({
				settings: user.settings,
			}))
			.findOne(),
	),
)

/**
 * Atom that automatically queries presence for the current user
 * Reads from userAtom and returns the presence data
 */
const currentUserPresenceAtom = Atom.make((get) => {
	const user = Result.getOrElse(get(userAtom), () => null)
	if (!user?.id) return Result.initial(false)

	return get(currentUserPresenceAtomFamily(user.id))
})

/**
 * Hook for managing the current user's presence status
 */
export function usePresence() {
	const { user } = useAuth()
	const presenceResult = useAtomValue(currentUserPresenceAtom)
	const currentPresence = Result.getOrElse(presenceResult, () => undefined)
	const computedStatusResult = useAtomValue(computedPresenceStatusAtom)
	const computedStatus = Result.getOrElse(computedStatusResult, () => "online" as PresenceStatus)
	const afkStateResult = useAtomValue(afkStateAtom)
	const afkState = Result.getOrElse(afkStateResult, () => ({
		isAFK: false,
		timeSinceActivity: 0,
		shouldMarkAway: false,
	}))

	const currentChannelId = useAtomValue(currentChannelIdAtom)
	const setManualStatus = useAtomSet(manualStatusAtom)

	// Track previous values to avoid duplicate updates
	const previousValuesRef = useRef<{
		status: PresenceStatus | null
		channelId: string | null
		initialUpdateSent: boolean
	}>({
		status: null,
		channelId: null,
		initialUpdateSent: false,
	})

	// Debounce timer ref
	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

	// Combined effect for both status and channel updates with debouncing and deduplication
	useEffect(() => {
		if (!user?.id) return

		// Send ONE initial update to mark user online (websocket only handles offline)
		// But debounce it to batch with any rapid initial changes
		if (!previousValuesRef.current.initialUpdateSent) {
			previousValuesRef.current.initialUpdateSent = true

			// Debounce the initial update to batch with rapid atom initialization
			debounceTimerRef.current = setTimeout(() => {
				previousValuesRef.current.status = computedStatus
				previousValuesRef.current.channelId = currentChannelId

				const program = Effect.gen(function* () {
					const client = yield* HazelRpcClient
					yield* client("userPresenceStatus.update", {
						status: computedStatus,
						activeChannelId: currentChannelId ? (currentChannelId as ChannelId) : null,
					})
				})

				runtime.runPromise(program).catch(console.error)
			}, 300) // Debounce to batch with rapid atom updates during mount

			return
		}

		// Check if values have actually changed
		const statusChanged = previousValuesRef.current.status !== computedStatus
		const channelChanged = previousValuesRef.current.channelId !== currentChannelId

		if (!statusChanged && !channelChanged) {
			return
		}

		// Clear existing debounce timer
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current)
		}

		// Debounce updates to batch rapid changes
		debounceTimerRef.current = setTimeout(() => {
			// Update previous values
			previousValuesRef.current.status = computedStatus
			previousValuesRef.current.channelId = currentChannelId

			// Send batched update with only changed fields
			const program = Effect.gen(function* () {
				const client = yield* HazelRpcClient
				const updates: {
					status?: PresenceStatus
					activeChannelId?: ChannelId | null
				} = {}

				if (statusChanged) {
					updates.status = computedStatus
				}

				if (channelChanged) {
					updates.activeChannelId = currentChannelId ? (currentChannelId as ChannelId) : null
				}

				yield* client("userPresenceStatus.update", updates)
			})

			runtime.runPromise(program).catch(console.error)
		}, 300) // 300ms debounce

		// Cleanup debounce timer on unmount
		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current)
			}
		}
	}, [computedStatus, currentChannelId, user?.id])

	useAtomMount(beforeUnloadAtom)
	useAtomMount(heartbeatAtom)

	const previousManualStatusRef = useRef<PresenceStatus>("online")

	const setStatus = useCallback(
		async (status: PresenceStatus, customMessage?: string) => {
			if (!user?.id) return

			setManualStatus({
				status,
				customMessage: customMessage ?? null,
				previousStatus: previousManualStatusRef.current,
			})

			previousManualStatusRef.current = status

			const program = Effect.gen(function* () {
				const client = yield* HazelRpcClient
				yield* client("userPresenceStatus.update", {
					status,
					customMessage: customMessage ?? null,
				})
			})

			await runtime.runPromise(program).catch(console.error)
		},
		[user?.id, setManualStatus],
	)

	const setCustomStatus = useCallback(
		async (
			emoji: string | null,
			message: string | null,
			expiresAt: Date | null,
			suppressNotifications?: boolean,
		) => {
			if (!user?.id) return

			const program = Effect.gen(function* () {
				const client = yield* HazelRpcClient
				yield* client("userPresenceStatus.update", {
					statusEmoji: emoji,
					customMessage: message,
					statusExpiresAt: expiresAt,
					suppressNotifications,
				})
			})

			await runtime.runPromise(program).catch(console.error)
		},
		[user?.id],
	)

	const clearCustomStatus = useCallback(async () => {
		if (!user?.id) return

		const program = Effect.gen(function* () {
			const client = yield* HazelRpcClient
			yield* client("userPresenceStatus.clearStatus", {})
		})

		await runtime.runPromise(program).catch(console.error)
	}, [user?.id])

	return {
		status: currentPresence?.status ?? computedStatus,
		isAFK: afkState.isAFK,
		setStatus,
		setCustomStatus,
		clearCustomStatus,
		activeChannelId: currentPresence?.activeChannelId,
		customMessage: currentPresence?.customMessage,
		statusEmoji: currentPresence?.statusEmoji,
		statusExpiresAt: currentPresence?.statusExpiresAt,
		suppressNotifications: currentPresence?.suppressNotifications ?? false,
	}
}

export interface QuietHoursInfo {
	isActive: boolean
	start?: string
	end?: string
}

/**
 * Hook to get another user's presence
 */
export function useUserPresence(userId: UserId) {
	const presenceResult = useAtomValue(currentUserPresenceAtomFamily(userId))
	const presence = Result.getOrElse(presenceResult, () => undefined)
	const userSettingsResult = useAtomValue(userSettingsAtomFamily(userId))
	const userSettings = Result.getOrElse(userSettingsResult, () => undefined)

	// Compute quiet hours state
	const quietHours = useMemo((): QuietHoursInfo | undefined => {
		// If user has opted out of showing quiet hours in status, don't return info
		if (userSettings?.settings?.showQuietHoursInStatus === false) {
			return undefined
		}

		const quietHoursStart = userSettings?.settings?.quietHoursStart ?? null
		const quietHoursEnd = userSettings?.settings?.quietHoursEnd ?? null

		// If quiet hours are not configured, don't return info
		if (!quietHoursStart || !quietHoursEnd) {
			return undefined
		}

		return {
			isActive: isInQuietHours(quietHoursStart, quietHoursEnd),
			start: quietHoursStart,
			end: quietHoursEnd,
		}
	}, [userSettings?.settings?.showQuietHoursInStatus, userSettings?.settings?.quietHoursStart, userSettings?.settings?.quietHoursEnd])

	return {
		status: presence?.status ?? ("offline" as const),
		isOnline:
			presence?.status === "online" ||
			presence?.status === "busy" ||
			presence?.status === "dnd" ||
			presence?.status === "away",
		activeChannelId: presence?.activeChannelId,
		customMessage: presence?.customMessage,
		statusEmoji: presence?.statusEmoji,
		statusExpiresAt: presence?.statusExpiresAt,
		lastUpdated: presence?.updatedAt,
		quietHours,
	}
}
