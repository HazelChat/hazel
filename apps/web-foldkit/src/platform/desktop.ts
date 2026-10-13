import { isTauri, isTauriMacOS } from "~/lib/tauri"

/**
 * Whether this build runs inside the Tauri desktop app. Fixed for the page's life, so views
 * may read it like a constant (legacy calls `isTauri()` / `isTauriMacOS()` during render).
 */
export const isDesktop: boolean = typeof window !== "undefined" && isTauri()

/** macOS draws the window controls over the content: headers leave room for them. */
export const hasDesktopTitlebar: boolean = typeof window !== "undefined" && isTauriMacOS()

/** A sidebar header's height: `h-14`, or taller with a divider under the window controls. */
export const sidebarHeaderHeightClass = (titlebar: boolean = hasDesktopTitlebar) =>
	titlebar
		? "pt-14 relative before:absolute before:top-10 before:left-0 before:right-0 before:h-px before:bg-sidebar-border"
		: "h-14"
