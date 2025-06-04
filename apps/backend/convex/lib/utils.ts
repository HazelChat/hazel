import type { BetterOmit, Expand } from "convex/server"

/**
 * omit helps you omit keys from an object more concisely.
 *
 * e.g. `omit({a: v.string(), b: v.number()}, ["a"])` is equivalent to
 * `{b: v.number()}`
 *
 * The alternative could be something like:
 * ```js
 * const obj = { a: v.string(), b: v.number() };
 * // omit does the following
 * const { a, ...rest } = obj;
 * const withoutA = rest;
 * ```
 *
 * @param obj The object to return a copy of without the specified keys.
 * @param keys The keys to omit from the object.
 * @returns A new object with the keys you omitted removed.
 */
export function omit<T extends Record<string, any>, Keys extends (keyof T)[]>(obj: T, keys: Keys) {
	return Object.fromEntries(
		Object.entries(obj).filter(([k]) => !keys.includes(k as Keys[number])),
	) as Expand<BetterOmit<T, Keys[number]>>
}

/**
 * pick helps you pick keys from an object more concisely.
 *
 * e.g. `pick({a: v.string(), b: v.number()}, ["a"])` is equivalent to
 * `{a: v.string()}`
 * The alternative could be something like:
 * ```js
 * const obj = { a: v.string(), b: v.number() };
 * // pick does the following
 * const { a } = obj;
 * const onlyA = { a };
 * ```
 *
 * @param obj The object to pick from. Often like { a: v.string() }
 * @param keys The keys to pick from the object.
 * @returns A new object with only the keys you picked and their values.
 */
export function pick<T extends Record<string, any>, Keys extends (keyof T)[]>(obj: T, keys: Keys) {
	return Object.fromEntries(Object.entries(obj).filter(([k]) => keys.includes(k as Keys[number]))) as {
		[K in Keys[number]]: T[K]
	}
}
