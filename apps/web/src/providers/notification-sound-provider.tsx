import { useAtomValue } from "@effect-atom/atom-react"
import { isChangeMessage, ShapeStream } from "@electric-sql/client"
import { eq, useLiveQuery } from "@tanstack/react-db"
import { type ReactNode, useEffect, useRef } from "react"
import { doNotDisturbAtom, quietHoursEndAtom, quietHoursStartAtom } from "~/atoms/notification-atoms"
import { organizationMemberCollection } from "~/db/collections"
import { useNotificationSound } from "~/hooks/use-notification-sound"
import { useAuth } from "~/lib/auth"
import { authenticatedFetch } from "~/lib/auth-fetch"
import { sendNativeNotification } from "~/lib/native-notifications"

interface NotificationSoundProviderProps {
	children: ReactNode
}

export function NotificationSoundProvider({ children }: NotificationSoundProviderProps) {
	const { user } = useAuth()
	const { playSound, settings, isPrimed } = useNotificationSound()
	const doNotDisturb = useAtomValue(doNotDisturbAtom)
	const quietHoursStart = useAtomValue(quietHoursStartAtom)
	const quietHoursEnd = useAtomValue(quietHoursEndAtom)
	const streamRef = useRef<ShapeStream | null>(null)
	const playSoundRef = useRef(playSound)

	// Keep playSound ref updated without triggering main effect re-runs
	useEffect(() => {
		playSoundRef.current = playSound
	}, [playSound])

	const { data: member } = useLiveQuery(
		(q) =>
			q
				.from({ member: organizationMemberCollection })
				.where(({ member }) => eq(member.userId, user?.id))
				.findOne(),
		[user?.id],
	)

	const organizationMemberId = member?.id

	useEffect(() => {
		// Don't start stream until audio is primed (user has clicked)
		if (!isPrimed) {
			return
		}

		if (!organizationMemberId || !settings.enabled) {
			return
		}

		// Check if we're in Do Not Disturb mode
		if (doNotDisturb) {
			return
		}

		// Helper to parse time string (HH:MM) to hour number
		const parseTimeToHour = (time: string): number => {
			const [hours] = time.split(":").map(Number)
			return hours ?? 0
		}

		// Check quiet hours
		const isInQuietHours = () => {
			if (!quietHoursStart || !quietHoursEnd) {
				return false
			}

			const now = new Date()
			const currentHour = now.getHours()
			const start = parseTimeToHour(quietHoursStart)
			const end = parseTimeToHour(quietHoursEnd)

			// Handle quiet hours that span midnight
			if (start <= end) {
				return currentHour >= start && currentHour < end
			}
			return currentHour >= start || currentHour < end
		}

		// Don't start stream if in quiet hours
		if (isInQuietHours()) {
			return
		}

		// Create the ShapeStream for notifications
		const electricUrl = import.meta.env.VITE_ELECTRIC_URL

		if (!electricUrl) {
			console.warn("VITE_ELECTRIC_URL is not configured")
			return
		}

		const stream = new ShapeStream({
			url: electricUrl,
			params: {
				table: "notifications",
				where: `"memberId" = '${organizationMemberId}'`,
			},
			fetchClient: authenticatedFetch,
			offset: "now",
			log: "changes_only",
			liveSse: true,
		})

		streamRef.current = stream

		const unsubscribe = stream.subscribe((messages) => {
			for (const message of messages) {
				if (isChangeMessage(message) && message.headers.operation === "insert") {
					playSoundRef.current()
					sendNativeNotification("Hazel", "You have a new notification")
					break
				}
			}
		})

		return () => {
			unsubscribe()
			streamRef.current = null
		}
	}, [isPrimed, organizationMemberId, settings.enabled, doNotDisturb, quietHoursStart, quietHoursEnd])

	return <>{children}</>
}
