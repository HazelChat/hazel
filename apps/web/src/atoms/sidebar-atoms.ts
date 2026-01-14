import { Atom } from "@effect-atom/atom-react"
import { Schema } from "effect"
import { platformStorageRuntime } from "~/lib/platform-storage"

/**
 * Sidebar state type
 */
export type SidebarState = "expanded" | "collapsed"

/**
 * Atom that stores whether the sidebar is open (desktop)
 * Persisted to localStorage as "sidebar_state" for backwards compatibility
 */
export const sidebarOpenAtom = Atom.kvs({
	runtime: platformStorageRuntime,
	key: "sidebar_state",
	schema: Schema.NullOr(Schema.Boolean),
	defaultValue: () => true,
})

/**
 * Atom that stores whether the mobile sidebar is open
 * Not persisted, resets on page load
 */
export const sidebarOpenMobileAtom = Atom.make<boolean>(false).pipe(Atom.keepAlive)

/**
 * Derived atom that returns the sidebar state ("expanded" or "collapsed")
 */
export const sidebarStateAtom = Atom.make((get) => {
	const isOpen = get(sidebarOpenAtom)
	return isOpen ? ("expanded" as const) : ("collapsed" as const)
}).pipe(Atom.keepAlive)

/**
 * Helper function to toggle the desktop sidebar
 */
export const toggleSidebar = () => {
	Atom.batch(() => {
		return Atom.update(sidebarOpenAtom, (open) => !open)
	})
}

/**
 * Helper function to toggle the mobile sidebar
 */
export const toggleMobileSidebar = () => {
	Atom.batch(() => {
		return Atom.update(sidebarOpenMobileAtom, (open) => !open)
	})
}

/**
 * Helper function to set the sidebar state
 */
export const setSidebarOpen = (open: boolean) => {
	Atom.batch(() => {
		return Atom.set(sidebarOpenAtom, open)
	})
}

/**
 * Helper function to set the mobile sidebar state
 */
export const setMobileSidebarOpen = (open: boolean) => {
	Atom.batch(() => {
		return Atom.set(sidebarOpenMobileAtom, open)
	})
}

/**
 * Atom family that manages the sidebar keyboard shortcut (Cmd/Ctrl+B)
 * Sets up global keyboard listener and toggles appropriate sidebar based on isMobile
 */
export const sidebarKeyboardShortcutAtomFamily = Atom.family((isMobile: boolean) =>
	Atom.make((get) => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "b" && (event.metaKey || event.ctrlKey)) {
				event.preventDefault()
				// Toggle the appropriate sidebar based on device type
				isMobile ? toggleMobileSidebar() : toggleSidebar()
			}
		}

		window.addEventListener("keydown", handleKeyDown)

		get.addFinalizer(() => {
			window.removeEventListener("keydown", handleKeyDown)
		})

		return isMobile
	}),
)
