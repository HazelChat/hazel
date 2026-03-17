const DEFAULT_LOGIN_GUARD_MS = 10_000

const activeLoginRedirects = new Map<string, ReturnType<typeof globalThis.setTimeout>>()

export interface WebLoginAttemptKeyParams {
	returnTo?: string
	organizationId?: string
	invitationToken?: string
}

export const getWebLoginAttemptKey = (params: WebLoginAttemptKeyParams): string =>
	JSON.stringify({
		returnTo: params.returnTo ?? "/",
		organizationId: params.organizationId ?? "",
		invitationToken: params.invitationToken ?? "",
	})

export const startWebLoginRedirectOnce = (
	key: string,
	start: () => void,
	timeoutMs = DEFAULT_LOGIN_GUARD_MS,
): boolean => {
	if (activeLoginRedirects.has(key)) {
		return false
	}

	const timeoutId = globalThis.setTimeout(() => {
		activeLoginRedirects.delete(key)
	}, timeoutMs)

	activeLoginRedirects.set(key, timeoutId)
	start()
	return true
}

export const resetWebLoginRedirect = (key: string): void => {
	const timeoutId = activeLoginRedirects.get(key)
	if (timeoutId !== undefined) {
		globalThis.clearTimeout(timeoutId)
	}
	activeLoginRedirects.delete(key)
}

export const resetAllWebLoginRedirects = (): void => {
	for (const timeoutId of activeLoginRedirects.values()) {
		globalThis.clearTimeout(timeoutId)
	}
	activeLoginRedirects.clear()
}
