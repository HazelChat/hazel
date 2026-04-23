/**
 * Clerk bearer-token helper for non-React callers (Electric fetch, RPC
 * middleware). Out-of-the-box Clerk: poll `window.Clerk` until it's loaded,
 * then call `session.getToken()`.
 */

interface ClerkLike {
	loaded?: boolean
	session?: { getToken: () => Promise<string | null> } | null
	redirectToSignIn?: (options: { redirectUrl: string }) => Promise<void>
}

declare global {
	interface Window {
		Clerk?: ClerkLike
	}
}

export const getClerkToken = async (): Promise<string | null> => {
	if (typeof window === "undefined") return null
	const deadline = Date.now() + 10_000
	while (!window.Clerk?.loaded && Date.now() < deadline) {
		await new Promise((r) => setTimeout(r, 50))
	}
	const session = window.Clerk?.session
	if (!session) return null
	try {
		return (await session.getToken()) ?? null
	} catch {
		return null
	}
}
