/**
 * Merges multiple React refs into a single ref callback.
 *
 * @param refs - An array of refs which can be mutable ref objects, legacy refs, or undefined/null.
 * @returns A ref callback function that assigns the given value to all provided refs.
 *
 * @typeParam T - The type of the ref value.
 */
export function mergeRefs<T = any>(
	refs: Array<React.MutableRefObject<T> | React.LegacyRef<T> | undefined | null>,
): React.RefCallback<T> {
	return (value) => {
		refs.forEach((ref) => {
			if (typeof ref === "function") {
				ref(value)
			} else if (ref != null) {
				;(ref as React.MutableRefObject<T | null>).current = value
			}
		})
	}
}

/**
 * Compares two values to determine if they are deeply equal.
 *
 * @param obj1 - The first value to compare.
 * @param obj2 - The second value to compare.
 *
 * @returns True if the values are deeply equal, otherwise false.
 */
export const isDeepEqual = (obj1: any, obj2: any): boolean => {
	// Check if both are the same reference
	if (obj1 === obj2) return true

	// Check if both are objects and not null
	if (typeof obj1 !== "object" || obj1 === null || typeof obj2 !== "object" || obj2 === null) {
		return false
	}

	// Check if they have the same number of keys
	const keys1 = Object.keys(obj1)
	const keys2 = Object.keys(obj2)
	if (keys1.length !== keys2.length) return false

	// Recursively check each key
	for (const key of keys1) {
		if (!keys2.includes(key) || !isDeepEqual(obj1[key], obj2[key])) {
			return false
		}
	}

	return true
}
