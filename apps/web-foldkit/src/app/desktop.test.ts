// @vitest-environment jsdom
import { describe, expect, test } from "vitest"
import { update } from "../main"
import * as Updates from "../platform/updates"
import { signedIn } from "../test/root-fixtures"
import * as Toast from "../ui/toast"
import { Message } from "./message"

/** The desktop app's update toast and menu, through the root. */

const found = Message.GotUpdatesMessage({
	message: Updates.Message.FoundUpdate({ version: "1.2.0", body: "Faster sync" }),
})

describe("desktop updates", () => {
	test("an available update shows a sticky toast whose button installs it", () => {
		const available = update(signedIn("/hazel/chat"), found).model
		const toast = available.toasts.toaster.toasts.find(
			(item) => item.title === "Update available: v1.2.0",
		)
		expect(toast).toMatchObject({ actionLabel: "Install & Restart", duration: null })

		const clicked = update(
			available,
			Message.GotToastsMessage({ message: Toast.Message.ClickedAction({ id: toast!.id }) }),
		)
		expect(clicked.model.desktopUpdate._tag).toBe("Downloading")
	})

	test("the menu's Check for Updates starts a check", () => {
		const result = update(
			signedIn("/hazel/chat"),
			Message.PressedDesktopMenuItem({ item: "CheckForUpdates" }),
		)
		expect(result.model.desktopUpdate._tag).toBe("Checking")
		expect(result.commands?.map((command) => command.name)).toContain(Updates.CheckForUpdate.name)
	})

	test("the menu's Settings opens the desktop settings page", () => {
		const result = update(
			signedIn("/hazel/chat"),
			Message.PressedDesktopMenuItem({ item: "OpenSettings" }),
		)
		expect(result.commands?.map((command) => command.args)).toContainEqual({
			url: "/hazel/my-settings/desktop",
		})
	})
})
