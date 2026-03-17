export interface WebCallbackKeyParams {
	code?: string
	state?: unknown
	error?: string
	error_description?: string
}

const activeAttempts = new Map<string, Promise<unknown>>()

const normalizeAttemptValue = (value: unknown): unknown => {
	if (Array.isArray(value)) {
		return value.map(normalizeAttemptValue)
	}

	if (value && typeof value === "object") {
		return Object.fromEntries(
			Object.entries(value)
				.sort(([left], [right]) => left.localeCompare(right))
				.map(([key, nested]) => [key, normalizeAttemptValue(nested)]),
		)
	}

	return value
}

const normalizeState = (state: WebCallbackKeyParams["state"]): string => {
	if (state === undefined) return ""

	if (typeof state === "string") {
		try {
			return JSON.stringify(normalizeAttemptValue(JSON.parse(state)))
		} catch {
			return state
		}
	}

	return JSON.stringify(normalizeAttemptValue(state))
}

export const getWebCallbackAttemptKey = (params: WebCallbackKeyParams): string =>
	JSON.stringify({
		code: params.code ?? "",
		state: normalizeState(params.state),
		error: params.error ?? "",
		errorDescription: params.error_description ?? "",
	})

export const runWebCallbackAttemptOnce = async <T>(
	key: string,
	runner: () => Promise<T>,
	keepResult: (result: T) => boolean,
): Promise<T> => {
	const existing = activeAttempts.get(key)
	if (existing) {
		return existing as Promise<T>
	}

	const promise = runner().then(
		(result) => {
			if (!keepResult(result)) {
				activeAttempts.delete(key)
			}
			return result
		},
		(error) => {
			activeAttempts.delete(key)
			throw error
		},
	)

	activeAttempts.set(key, promise)
	return promise
}

export const resetWebCallbackAttempt = (key: string): void => {
	activeAttempts.delete(key)
}

export const resetAllWebCallbackAttempts = (): void => {
	activeAttempts.clear()
}
