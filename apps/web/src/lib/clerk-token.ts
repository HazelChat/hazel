/**
 * Clerk bearer-token helpers for non-React callers (RPC middleware, auth-fetch,
 * electric-fetch). `clerkReady()` resolves once `<ClerkProvider>` has finished
 * hydrating Clerk; it's cached so every caller shares one wait.
 */

type ClerkUnsubscribe = () => void

interface ClerkLike {
	loaded?: boolean
	session?: {
		getToken: (options?: { template?: string }) => Promise<string | null>
	} | null
	redirectToSignIn?: (options: { redirectUrl: string }) => Promise<void>
	addListener?: (listener: (emission: unknown) => void) => ClerkUnsubscribe
}

declare global {
	interface Window {
		Clerk?: ClerkLike
	}
}

const CLERK_READY_TIMEOUT_MS = 10_000

let cached: Promise<ClerkLike | null> | null = null

export const clerkReady = (): Promise<ClerkLike | null> => {
	if (cached) return cached
	cached = new Promise<ClerkLike | null>((resolve) => {
		if (typeof window === "undefined") {
			resolve(null)
			return
		}

		const timeout = setTimeout(() => resolve(window.Clerk ?? null), CLERK_READY_TIMEOUT_MS)

		const subscribe = (clerk: ClerkLike) => {
			if (clerk.loaded) {
				clearTimeout(timeout)
				resolve(clerk)
				return
			}
			const unsub = clerk.addListener?.(() => {
				if (clerk.loaded) {
					unsub?.()
					clearTimeout(timeout)
					resolve(clerk)
				}
			})
		}

		if (window.Clerk) {
			subscribe(window.Clerk)
			return
		}

		// `<ClerkProvider>` sets `window.Clerk` during its mount; poll briefly
		// until it appears, then hand off to addListener.
		const iv = setInterval(() => {
			if (window.Clerk) {
				clearInterval(iv)
				subscribe(window.Clerk)
			}
		}, 20)
		setTimeout(() => clearInterval(iv), CLERK_READY_TIMEOUT_MS)
	})
	return cached
}

export const getClerkToken = async (): Promise<string | null> => {
	const clerk = await clerkReady()
	if (!clerk?.session) return null
	try {
		return (await clerk.session.getToken()) ?? null
	} catch {
		return null
	}
}
