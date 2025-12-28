import { Atom } from "@effect-atom/atom-react"

/**
 * Available pages in the command palette
 */
export type CommandPalettePage = "home" | "channels" | "members" | "status"

/**
 * Command palette navigation state interface
 * Note: isOpen is controlled by parent component props, not stored in atoms
 */
export interface CommandPaletteState {
	currentPage: CommandPalettePage
	pageHistory: CommandPalettePage[]
	inputValue: string
	context?: {
		channelId?: string
		channelName?: string
	}
}

/**
 * Main command palette navigation state atom
 *
 * @example
 * ```tsx
 * // Read state
 * const state = useAtomValue(commandPaletteAtom)
 *
 * // Update state (use hook-based setter for React components)
 * const setState = useAtomSet(commandPaletteAtom)
 * setState((prev) => ({ ...prev, currentPage: "channels" }))
 * ```
 */
export const commandPaletteAtom = Atom.make<CommandPaletteState>({
	currentPage: "home",
	pageHistory: [],
	inputValue: "",
}).pipe(Atom.keepAlive)

/**
 * Derived atom that checks if we can go back in navigation
 */
export const canGoBackAtom = Atom.make((get) => {
	const state = get(commandPaletteAtom)
	return state.pageHistory.length > 0
}).pipe(Atom.keepAlive)
