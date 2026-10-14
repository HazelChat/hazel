/**
 * The desktop app's session, for requests that can't carry the API's session cookie. The
 * desktop app registers a provider at startup; in a browser none is set and requests rely
 * on the cookie alone.
 */

let provider: (() => Promise<string | null>) | null = null

export const setSessionBearerProvider = (next: () => Promise<string | null>) => {
	provider = next
}

/** `Authorization` for the current session, or `null` (browser, or signed out). */
export const sessionAuthorization = async (): Promise<string | null> => {
	if (provider === null) return null
	const credential = await provider()
	return credential === null ? null : `Bearer ${credential}`
}
