import { usePostHog } from "posthog-js/react"
import { useEffect, useRef } from "react"
import { useAuth } from "~/lib/auth"

export function usePostHogIdentify() {
	const posthog = usePostHog()
	const { user } = useAuth()
	const previousUserIdRef = useRef<string | null>(null)

	useEffect(() => {
		if (user && user.id !== previousUserIdRef.current) {
			posthog.identify(user.id, {
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				organizationId: user.organizationId,
				role: user.role,
			})
			previousUserIdRef.current = user.id
		} else if (!user && previousUserIdRef.current) {
			posthog.reset()
			previousUserIdRef.current = null
		}
	}, [posthog, user])
}
