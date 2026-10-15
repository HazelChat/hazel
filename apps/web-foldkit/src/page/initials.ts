/** An avatar fallback for a name: the first letters of its first two words, else its first two letters. */
export const initialsOf = (name: string): string => {
	const [first, second] = name.trim().split(/\s+/)
	return (second === undefined ? (first ?? "").slice(0, 2) : `${first?.charAt(0)}${second.charAt(0)}`).toUpperCase()
}
