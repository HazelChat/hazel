// @vitest-environment jsdom
import * as Scene from "foldkit/scene"
import { describe, test } from "vitest"
import { successToast } from "../../../data/actions"
import * as Menu from "../../../ui/menu"
import { FocusTriggerOnPress } from "../../../ui/menu-view"
import * as Modal from "../../../ui/modal"
import { makeShared, organizationId, pageScene, portalModalMounted } from "../../../test/pages-fixtures"
import { connection, guild, otherGuild, syncConnectionId } from "../../../test/pages-integrations-fixtures"
import { PageOutMessage } from "../../out-message"
import { CreateConnection, FocusGuildSearch } from "./add-connection"
import { DiscordGuilds } from "./discord"
import { Message, type Model } from "./model"
import { DeleteConnection, init, ListConnections, ListDiscordGuilds, update } from "./update"
import { view } from "./view"

/** The chat sync list through its view: states, opening a connection, deleting and connecting a guild. */

const shared = makeShared()
const config = pageScene(update, view, shared)
const step = (model: Model, message: Message) => update(model, message, shared).model
const initial = init(undefined, shared).model
const loadedWith = (connections: ReadonlyArray<typeof connection>) =>
	step(
		step(initial, Message.SucceededListConnections({ organizationId, connections })),
		Message.SucceededListDiscordGuilds({ organizationId, version: 1, guilds: [guild, otherGuild] }),
	)
const loaded = loadedWith([connection])
const withAddModalOpen = { ...loaded, addModal: Modal.open(loaded.addModal).model }

// The icon-only delete button is named by its icon's <title> ("badge 13"), so it is found by `title`.
const deleteTrigger = Scene.title("Delete connection")
const addTrigger = Scene.role("button", { name: /Add Third Party Connection/ })
const dialog = Scene.role("dialog")
const confirmDelete = Scene.within(dialog, Scene.role("button", { name: "Delete Connection" }))
const connect = Scene.within(dialog, Scene.role("button", { name: "Connect" }))
const search = Scene.placeholder("Search servers...")
const tryAgain = Scene.role("button", { name: "Try again" })
/** The add menu trigger focuses itself on press; the add modal is a controlled (non-submodel) modal. */
const addTriggerMounted = Scene.Mount.resolve(
	FocusTriggerOnPress,
	Menu.Message.CompletedFocusTriggerOnPress(),
)
const addModalMounted = Scene.Mount.resolve(
	{ name: "PortalModal" },
	Message.GotAddModalMessage({ message: Modal.Message.CompletedPortalModal() }),
)

describe("list states", () => {
	test("a loading list shows a spinner and no add button", () => {
		Scene.scene(
			config,
			Scene.given(initial),
			Scene.expect(Scene.text("Loading connections...")).toExist(),
			Scene.expect(addTrigger).toBeAbsent(),
		)
	})

	test("a failed list explains why, not 'no connections', and Try again reloads it", () => {
		Scene.scene(
			config,
			Scene.given(step(initial, Message.FailedListConnections({ organizationId, reason: "Offline" }))),
			Scene.expect(Scene.text("Failed to load connections")).toExist(),
			Scene.expect(Scene.text("Check your internet connection and try again.")).toExist(),
			Scene.expect(Scene.text("No sync connections yet")).toBeAbsent(),
			Scene.click(tryAgain),
			Scene.Command.expectExact(ListConnections({ organizationId })),
			Scene.expect(Scene.text("Loading connections...")).toExist(),
			Scene.Command.resolve(
				ListConnections,
				Message.SucceededListConnections({ organizationId, connections: [connection] }),
			),
			Scene.Command.resolve(
				ListDiscordGuilds,
				Message.SucceededListDiscordGuilds({ organizationId, version: 1, guilds: [guild] }),
			),
			addTriggerMounted,
			Scene.expect(Scene.text("Hazel Community")).toExist(),
		)
	})

	test("a failure a retry won't fix offers no Try again", () => {
		Scene.scene(
			config,
			Scene.given(
				step(initial, Message.FailedListConnections({ organizationId, reason: "SignedOut" })),
			),
			Scene.expect(Scene.text("Failed to load connections")).toExist(),
			Scene.expect(Scene.text("Please sign in again to continue.")).toExist(),
			Scene.expect(tryAgain).toBeAbsent(),
		)
	})

	test("an empty list shows the empty state with its own add button", () => {
		Scene.scene(
			config,
			Scene.given(loadedWith([])),
			addTriggerMounted,
			addTriggerMounted,
			Scene.expect(Scene.text("No sync connections yet")).toExist(),
			Scene.expect(addTrigger).toExist(),
		)
	})

	test("clicking a card opens the connection page", () => {
		Scene.scene(
			config,
			Scene.given(loaded),
			addTriggerMounted,
			Scene.expect(Scene.text("Active")).toExist(),
			Scene.click(Scene.text("Hazel Community")),
			Scene.expectOutMessage(
				PageOutMessage.RequestedNavigation({
					href: `/hazel/settings/chat-sync/${syncConnectionId}`,
					replace: false,
				}),
			),
		)
	})
})

describe("delete a connection", () => {
	test("confirming deletes, toasts, closes the dialog and refreshes the shown list", () => {
		Scene.scene(
			config,
			Scene.given(loaded),
			addTriggerMounted,
			Scene.click(deleteTrigger),
			portalModalMounted,
			Scene.expect(Scene.within(dialog, Scene.text("Hazel Community"))).toExist(),
			Scene.click(confirmDelete),
			Scene.Command.expectExact(DeleteConnection({ syncConnectionId })),
			Scene.expect(Scene.within(dialog, Scene.role("button", { name: "Deleting..." }))).toBeDisabled(),
			Scene.Command.resolve(DeleteConnection, Message.SucceededDeleteConnection()),
			Scene.expectOutMessage(
				PageOutMessage.RequestedToast({ toast: successToast("Connection deleted") }),
			),
			Scene.expect(dialog).toBeAbsent(),
			Scene.Mount.expectEnded(Modal.PortalModal),
			// The list stays while it refreshes.
			Scene.expect(Scene.text("Loading connections...")).toBeAbsent(),
			Scene.expect(Scene.text("Hazel Community")).toExist(),
			Scene.Command.resolve(
				ListConnections,
				Message.SucceededListConnections({ organizationId, connections: [] }),
			),
			Scene.expect(Scene.text("No sync connections yet")).toExist(),
			addTriggerMounted,
		)
	})

	test("a failed delete toasts the reason and re-enables the confirm button", () => {
		Scene.scene(
			config,
			Scene.given(loaded),
			addTriggerMounted,
			Scene.click(deleteTrigger),
			portalModalMounted,
			Scene.click(confirmDelete),
			Scene.Command.resolve(DeleteConnection, Message.FailedDeleteConnection({ reason: "NotFound" })),
			Scene.expectOutMessage(
				PageOutMessage.RequestedToast({
					toast: {
						intent: "error",
						title: "Connection not found",
						description: "This connection may have already been deleted.",
					},
				}),
			),
			Scene.expect(confirmDelete).toBeEnabled(),
		)
	})

	test("Cancel closes the dialog without deleting", () => {
		Scene.scene(
			config,
			Scene.given(loaded),
			addTriggerMounted,
			Scene.click(deleteTrigger),
			portalModalMounted,
			Scene.click(Scene.within(dialog, Scene.role("button", { name: "Cancel" }))),
			Scene.Command.expectNone(),
			Scene.expect(dialog).toBeAbsent(),
			Scene.Mount.expectEnded(Modal.PortalModal),
		)
	})
})

describe("connect a Discord server", () => {
	test("Connect stays disabled until a server is picked, then creates the connection", () => {
		Scene.scene(
			config,
			Scene.given(withAddModalOpen),
			addTriggerMounted,
			addModalMounted,
			Scene.Command.resolve(FocusGuildSearch, Message.CompletedFocusGuildSearch()),
			Scene.expect(connect).toBeDisabled(),
			Scene.type(search, "rust"),
			Scene.expect(Scene.text("Design Systems Guild")).toBeAbsent(),
			Scene.click(Scene.role("button", { name: "Rust Hackers" })),
			Scene.expect(search).toBeAbsent(),
			Scene.expect(connect).toBeEnabled(),
			Scene.click(connect),
			Scene.Command.expectExact(
				CreateConnection({
					organizationId,
					externalWorkspaceId: otherGuild.id,
					externalWorkspaceName: otherGuild.name,
				}),
			),
			Scene.expect(
				Scene.within(dialog, Scene.role("button", { name: "Connecting..." })),
			).toBeDisabled(),
			Scene.Command.resolve(CreateConnection, Message.SucceededCreateConnection()),
			Scene.expectOutMessage(
				PageOutMessage.RequestedToast({ toast: successToast("Discord connection created") }),
			),
			Scene.expect(dialog).toBeAbsent(),
			Scene.Mount.expectEnded(Modal.PortalModal),
			Scene.Command.resolve(
				ListConnections,
				Message.SucceededListConnections({ organizationId, connections: [connection] }),
			),
			Scene.expect(Scene.text("Hazel Community")).toExist(),
		)
	})

	test("a failed create keeps the picked server and re-enables Connect", () => {
		Scene.scene(
			config,
			Scene.given({ ...withAddModalOpen, selectedGuild: guild }),
			addTriggerMounted,
			addModalMounted,
			Scene.click(connect),
			Scene.Command.resolve(
				CreateConnection,
				Message.FailedCreateConnection({ reason: "AlreadyExists" }),
			),
			Scene.expectOutMessage(
				PageOutMessage.RequestedToast({
					toast: {
						intent: "error",
						title: "Connection already exists",
						description: "A connection to this Discord server already exists in your workspace.",
					},
				}),
			),
			Scene.expect(Scene.within(dialog, Scene.text("Design Systems Guild"))).toExist(),
			Scene.expect(connect).toBeEnabled(),
		)
	})

	test("without Discord authorized, the modal links to the Discord integration", () => {
		Scene.scene(
			config,
			Scene.given({
				...withAddModalOpen,
				discordGuilds: DiscordGuilds.Failure({ error: "NotConnected" }),
			}),
			addTriggerMounted,
			addModalMounted,
			Scene.expect(connect).toBeDisabled(),
			Scene.expect(Scene.within(dialog, tryAgain)).toBeAbsent(),
			Scene.click(Scene.role("button", { name: "Open Discord Integration" })),
			Scene.expectOutMessage(
				PageOutMessage.RequestedNavigation({
					href: "/hazel/settings/integrations/discord",
					replace: false,
				}),
			),
		)
	})

	test("guilds that failed to load say why, and Try again queries them again", () => {
		Scene.scene(
			config,
			Scene.given({ ...withAddModalOpen, discordGuilds: DiscordGuilds.Failure({ error: "Offline" }) }),
			addTriggerMounted,
			addModalMounted,
			Scene.expect(Scene.within(dialog, Scene.text("Connection lost"))).toExist(),
			Scene.expect(Scene.text("Open Discord Integration")).toBeAbsent(),
			Scene.click(Scene.within(dialog, tryAgain)),
			Scene.Command.expectExact(ListDiscordGuilds({ organizationId, version: 2 })),
			Scene.expect(Scene.within(dialog, Scene.text("Loading Discord guilds..."))).toExist(),
			Scene.Command.resolve(
				ListDiscordGuilds,
				Message.SucceededListDiscordGuilds({ organizationId, version: 2, guilds: [guild] }),
			),
			Scene.Command.resolve(FocusGuildSearch, Message.CompletedFocusGuildSearch()),
			Scene.expect(
				Scene.within(dialog, Scene.role("button", { name: /Design Systems Guild/ })),
			).toExist(),
		)
	})
})
