import { normalizeHotkey } from "@tanstack/react-hotkeys"
import { describe, expect, it } from "vitest"
import { HOTKEY_DEFINITIONS_BY_ID } from "~/lib/hotkeys/hotkey-registry"
import { resolveHotkeys, sanitizeHotkeyOverrides } from "./hotkey-atoms"

describe("hotkey-atoms", () => {
	it("uses default hotkeys when no overrides are present", () => {
		const resolvedHotkeys = resolveHotkeys({})
		expect(resolvedHotkeys["commandPalette.open"]).toBe(
			HOTKEY_DEFINITIONS_BY_ID["commandPalette.open"].defaultHotkey,
		)
		expect(resolvedHotkeys["sidebar.toggle"]).toBe(
			HOTKEY_DEFINITIONS_BY_ID["sidebar.toggle"].defaultHotkey,
		)
	})

	it("applies valid overrides", () => {
		const override = "Ctrl+Shift+P"
		const resolvedHotkeys = resolveHotkeys({
			"search.open": override,
		})

		expect(resolvedHotkeys["search.open"]).toBe(normalizeHotkey(override))
	})

	it("ignores invalid hotkey overrides", () => {
		const defaultHotkey = HOTKEY_DEFINITIONS_BY_ID["search.open"].defaultHotkey
		const resolvedHotkeys = resolveHotkeys({
			"search.open": "Definitely+Invalid+Key",
		})

		expect(resolvedHotkeys["search.open"]).toBe(defaultHotkey)
	})

	it("ignores unknown action ids", () => {
		const overrides = sanitizeHotkeyOverrides({
			"commandPalette.open": "Mod+P",
			"unknown.action": "Mod+Q",
		})

		expect(overrides["commandPalette.open"]).toBe(normalizeHotkey("Mod+P"))
		expect("unknown.action" in overrides).toBe(false)
	})
})
