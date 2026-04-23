/**
 * Clerk bearer-token helpers for non-React callers.
 * `<ClerkProvider>` owns the Clerk lifecycle; we just wait for it.
 */

interface ClerkLike {
	loaded?: boolean
	session?: {
		getToken: (options?: { template?: string }) => Promise<string | null>
	} | null
	addListener?: (listener: () => void) => () => void
	redirectToSignIn?: (options: { redirectUrl: string }) => Promise<void>
}

declare global {
	interface Window {
		Clerk?: ClerkLike
	}
}

export const waitForClerk = (): Promise<ClerkLike | null> =>
	new Promise((resolve) => {
		if (typeof window === "undefined") return resolve(null)
		const clerk = window.Clerk
		if (!clerk) return resolve(null)
		if (clerk.loaded) return resolve(clerk)
		const unsubscribe = clerk.addListener?.(() => {
			if (clerk.loaded) {
				unsubscribe?.()
				resolve(clerk)
			}
		})
	})

export const getClerkToken = async (): Promise<string | null> => {
	const clerk = await waitForClerk()
	if (!clerk?.session) return null
	try {
		return (await clerk.session.getToken()) ?? null
	} catch {
		return null
	}
}
