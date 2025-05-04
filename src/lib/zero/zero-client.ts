import type { Zero as ZeroType } from "@rocicorp/zero"
import { createZero } from "@rocicorp/zero/solid"
import { type Schema, schema } from "./schema"

let _zero: ZeroType<Schema> | null = null

/**
 * Call this once you have a userId + a getToken() from Clerk.
 * Subsequent calls just return the same instance.
 */
export async function initZero(userId: string, getTokenFn: () => Promise<string>) {
	if (_zero) return _zero

	// @ts-expect-error
	_zero = createZero({
		userID: userId,
		auth: async () => {
			const token = await getTokenFn()
			if (!token) {
				throw new Error("ZeroSync token missing")
			}
			return token
		},
		server: import.meta.env.VITE_PUBLIC_SERVER,
		schema,
		kvStore: "idb",
	})

	return _zero
}

/**
 * After initZero has run, you can import this anywhere.
 * Throws if you forgot to call initZero().
 */
export function getZero(): ZeroType<Schema> {
	if (!_zero) {
		throw new Error("Zero not initialized.  Make sure you called initZero(...) first.")
	}
	return _zero
}
