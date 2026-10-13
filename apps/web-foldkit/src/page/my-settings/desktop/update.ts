import { Effect, Schema } from "effect"
import { Command } from "foldkit"
import { modifyFields } from "foldkit/struct"
import { getTauriApp } from "@hazel/desktop/bridge"
import { disableAutostart, enableAutostart, isAutostartEnabled } from "~/lib/tauri-autostart"
import { isDesktop } from "../../../platform/desktop"
import { PageOutMessage } from "../../out-message"
import * as Interaction from "../../../ui/aria/interaction"
import type { PageReturn } from "../../contract"
import { embedInteraction } from "../shared"
import { Message } from "./message"
import type { Model } from "./model"

export const interaction = embedInteraction<Model, Message>((message) =>
	Message.GotInteractionMessage({ message }),
)

/** Reads the autostart state; a failure reads as off, as the legacy mount effect does. */
const readAutostart = Effect.tryPromise(() => isAutostartEnabled()).pipe(
	Effect.catch(() => Effect.succeed(false)),
)

export const CheckAutostart = Command.define("CheckAutostart", {
	messages: [Message.CheckedAutostart],
	execute: readAutostart.pipe(Effect.map((isEnabled) => Message.CheckedAutostart({ isEnabled }))),
})

/** On failure the legacy handler re-reads the real state instead of keeping the toggle. */
export const SetAutostart = Command.define("SetAutostart", {
	args: { isEnabled: Schema.Boolean },
	messages: [Message.CompletedSetAutostart],
	execute: ({ isEnabled }) =>
		Effect.tryPromise(() => (isEnabled ? enableAutostart() : disableAutostart())).pipe(
			Effect.as(isEnabled),
			Effect.catch(() => readAutostart),
			Effect.map((isEnabled) => Message.CompletedSetAutostart({ isEnabled })),
		),
})

/** `useAppVersion()`: the installed version on desktop. */
export const ReadVersion = Command.define("ReadVersion", {
	messages: [Message.ReadAppVersion],
	execute: Effect.tryPromise(async () => (await getTauriApp()?.getVersion()) ?? null).pipe(
		Effect.catch(() => Effect.succeed(null)),
		Effect.map((version) => Message.ReadAppVersion({ version })),
	),
})

export const init = (): PageReturn<Model, Message> => ({
	model: { autostartEnabled: null, isUpdating: false, version: null, interaction: Interaction.init() },
	commands: isDesktop ? [CheckAutostart(), ReadVersion()] : [CheckAutostart()],
})

export const update = (model: Model, message: Message): PageReturn<Model, Message> =>
	Message.match<PageReturn<Model, Message>>(message, {
		// The initial read only fills an unknown state, so it can never undo a later write.
		CheckedAutostart: ({ isEnabled }) => ({
			model:
				model.autostartEnabled === null ? modifyFields(model, { autostartEnabled: () => isEnabled }) : model,
		}),
		ToggledAutostart: ({ isSelected }) =>
			model.isUpdating || model.autostartEnabled === null
				? { model }
				: {
						model: modifyFields(model, { isUpdating: () => true }),
						commands: [SetAutostart({ isEnabled: isSelected })],
					},
		CompletedSetAutostart: ({ isEnabled }) => ({
			model: modifyFields(model, { autostartEnabled: () => isEnabled, isUpdating: () => false }),
		}),
		GotInteractionMessage: ({ message: child }) => interaction.fold(model, child),
		ReadAppVersion: ({ version }) => ({ model: modifyFields(model, { version: () => version }) }),
		ClickedCheckForUpdates: () => ({ model, outMessage: PageOutMessage.RequestedUpdateCheck() }),
		ClickedInstallUpdate: () => ({ model, outMessage: PageOutMessage.RequestedUpdateInstall() }),
	})
