import type { Value } from "convex/values"

/**
 * An async function returning the JWT-encoded OpenID Connect Identity Token
 * if available.
 *
 * `forceRefreshToken` is `true` if the server rejected a previously
 * returned token, and the client should try to fetch a new one.
 *
 * See {@link ConvexReactClient.setAuth}.
 *
 * @public
 */
export type AuthTokenFetcher = (args: { forceRefreshToken: boolean }) => Promise<string | null | undefined>

export function parseArgs(args: Record<string, Value> | undefined): Record<string, Value> {
	if (args === undefined) {
		return {}
	}
	if (!isSimpleObject(args)) {
		throw new Error(`The arguments to a Convex function must be an object. Received: ${args as any}`)
	}
	return args
}

/**
 * Check whether a value is a plain old JavaScript object.
 */
export function isSimpleObject(value: unknown) {
	const isObject = typeof value === "object"
	const prototype = Object.getPrototypeOf(value)
	const isSimple =
		prototype === null ||
		prototype === Object.prototype ||
		// Objects generated from other contexts (e.g. across Node.js `vm` modules) will not satisfy the previous
		// conditions but are still simple objects.
		prototype?.constructor?.name === "Object"
	return isObject && isSimple
}

/**
 * A type for the empty object `{}`.
 *
 * Note that we don't use `type EmptyObject = {}` because that matches every object.
 */
export type EmptyObject = Record<string, never>
