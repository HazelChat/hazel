// @vitest-environment jsdom
import { Option } from "effect"
import { fromString } from "foldkit/url"
import { describe, expect, test } from "vitest"
import { init, Message, update } from "../main"
import * as Toast from "../ui/toast"
import { DEFAULT_SOUND_SETTINGS } from "../notification-sound"
import { defaultThemePreference } from "../theme"
import * as Toaster from "./toaster"
import { init as initToasts, push } from "./toaster"

/** `RequestedToast` → the kit's `showRequest`; a sonner `id` updates its toast in place. */

describe("root toaster", () => {
	test("a request adds a toast with the kit's kind, title and description", () => {
		const shown = push(initToasts(), { intent: "error", title: "Failed", description: "Try again" })
		expect(shown.model.toaster.toasts).toHaveLength(1)
		expect(shown.model.toaster.toasts[0]).toMatchObject({
			kind: "error",
			title: "Failed",
			description: "Try again",
		})
	})

	test("a toast with a known id replaces it (loading, then success)", () => {
		const loading = push(initToasts(), {
			intent: "loading",
			title: "Saving...",
			description: null,
			id: "save",
		})
		const done = push(loading.model, { intent: "success", title: "Saved", description: null, id: "save" })
		expect(done.model.toaster.toasts).toHaveLength(1)
		expect(done.model.toaster.toasts[0]).toMatchObject({ kind: "success", title: "Saved" })
		const other = push(done.model, { intent: "info", title: "Other", description: null })
		expect(other.model.toaster.toasts.map((toast) => toast.title)).toEqual(["Other", "Saved"])
	})

	test("a page's RequestedToast goes through the root into the toaster", () => {
		const path =
			"/hazel/my-settings/linked-accounts?connection_status=error&provider=discord&error_code=db_error"
		const booted = Option.match(fromString(`http://localhost${path}`), {
			onNone: () => expect.unreachable("url"),
			onSome: (url) =>
				init(
					{
						themePreference: defaultThemePreference(),
						systemTheme: "light",
						soundSettings: DEFAULT_SOUND_SETTINGS,
						sessionStartMs: 0,
						isMobile: false,
						isCreateChannelHintDismissed: false,
					},
					url,
				),
		})
		expect(booted.model.toasts.toaster.toasts).toMatchObject([
			{ kind: "error", title: "Failed to link Discord account", description: "db_error" },
		])
		// The kit's own Messages fold back into the slot through `GotToastsMessage`.
		const hovered = update(
			booted.model,
			Message.GotToastsMessage({ message: Toast.Message.HoveredToaster() }),
		)
		expect(hovered.model.toasts.toaster.isExpanded).toBe(true)
	})
})

const available = {
	intent: "info",
	title: "Update",
	description: null,
	id: "update",
	isSticky: true,
	action: { label: "Install & Restart", key: "InstallUpdate" },
} as const

describe("update toast replacement", () => {
	test("clears sticky lifetime and action when a failure replaces availability", () => {
		const initial = Toaster.push(Toaster.init(), available).model
		const failed = Toaster.push(initial, {
			intent: "error",
			title: "Failed",
			description: null,
			id: "update",
		}).model
		expect(failed.toaster.toasts[0]).toMatchObject({
			actionLabel: null,
			duration: 4000,
			isRemoved: false,
		})
		expect(failed.actionsById).toEqual({})
	})
	test("creates a visible toast after its action dismissed the previous one", () => {
		const initial = Toaster.push(Toaster.init(), available).model
		const id = initial.idsByKey.update!
		const clicked = Toaster.update(initial, Toaster.Message.ClickedAction({ id })).model
		const downloading = Toaster.push(clicked, {
			intent: "loading",
			title: "Downloading",
			description: null,
			id: "update",
		}).model
		const nextId = downloading.idsByKey.update!
		expect(nextId).not.toBe(id)
		expect(downloading.toaster.toasts.find((toast) => toast.id === nextId)?.isRemoved).toBe(false)
	})
})
