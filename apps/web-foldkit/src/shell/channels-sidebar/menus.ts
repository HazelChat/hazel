import type { ChannelSectionId } from "@hazel/schema"
import { Array, Option, Schema } from "effect"
import type { ChildAttribute, Html, HtmlBuilder } from "foldkit/html"
import {
	IconCirclePlus,
	IconDots,
	IconFolderPlus,
	IconGear,
	IconHashtag,
	IconLeave,
	IconPlus,
	IconStar,
	IconTrash,
	IconVolume,
	IconVolumeMute,
} from "../../icons"
import { button } from "../../ui/button"
import * as Menu from "../../ui/menu"
import { menuLabel, view as menuView } from "../../ui/menu-view"
import { SectionAction } from "./model"
import type { ChannelEntry, Section } from "./rows"

/** The channel row "dots" menu (`ChannelItem`) and the section "+" menu (`SectionGroup`). */

export const rowMenuId = (channelId: string) => `channel-menu-${channelId}`
export const sectionMenuId = (sectionKey: string) => `section-menu-${sectionKey}`

const DEFAULT_SECTION_KEY = "section:default"
const sectionKeyOf = (sectionId: string | null) =>
	sectionId === null ? DEFAULT_SECTION_KEY : `section:${sectionId}`

// KEYS

/** The row menu's fixed items; "Move to section" leaves are keyed per section (`sectionIdOfKey`). */
export const RowMenuKey = Schema.Literals(["mute", "favorite", "settings", "delete", "leave"])
export type RowMenuKey = typeof RowMenuKey.Type
export const decodeRowMenuKey = Schema.decodeUnknownOption(RowMenuKey)

/** The section menu's items: its actions plus "Delete section". */
export const SectionMenuKey = Schema.Union([SectionAction, Schema.Literal("delete-section")])
export type SectionMenuKey = typeof SectionMenuKey.Type
export const decodeSectionMenuKey = Schema.decodeUnknownOption(SectionMenuKey)

const rowItem = (key: RowMenuKey, options?: Parameters<typeof Menu.item>[1]) => Menu.item(key, options)

// ENTRIES

export const rowMenuEntries = (
	sections: ReadonlyArray<Section>,
	canDelete: boolean,
): ReadonlyArray<Menu.Entry> => [
	rowItem("mute"),
	rowItem("favorite"),
	...(sections.length > 0
		? [
				Menu.item("move", {
					submenu: [
						Menu.leaf(DEFAULT_SECTION_KEY, { textValue: "Channels (Default)" }),
						...sections.map((section) =>
							Menu.leaf(sectionKeyOf(section.id), { textValue: section.name }),
						),
					],
				}),
			]
		: []),
	Menu.separator,
	rowItem("settings"),
	...(canDelete ? [rowItem("delete", { intent: "Danger" })] : []),
	Menu.separator,
	rowItem("leave", { intent: "Danger" }),
]

/** The move target a submenu key names: `null` for the default section. */
export const sectionIdOfKey = (
	key: string,
	sections: ReadonlyArray<Section>,
): Option.Option<ChannelSectionId | null> =>
	key === DEFAULT_SECTION_KEY
		? Option.some(null)
		: Option.map(
				Array.findFirst(sections, (section) => sectionKeyOf(section.id) === key),
				(section) => section.id,
			)

/** `menuActions` plus "Delete section" for editable sections. */
export const sectionMenuEntries = (
	actions: ReadonlyArray<SectionAction>,
	isEditable: boolean,
): ReadonlyArray<Menu.Entry> => [
	...actions.map((action) => Menu.item(action satisfies SectionMenuKey)),
	...(isEditable
		? [Menu.separator, Menu.item("delete-section" satisfies SectionMenuKey, { intent: "Danger" })]
		: []),
]

export const closedMenu = (id: string, placement?: "right top") =>
	Menu.init({ id, ...(placement ? { placement } : {}) })

/** A channel row's dots menu while it is closed. */
export const closedRowMenu = (channelId: string) => closedMenu(rowMenuId(channelId), "right top")

// VIEW

const rowMenuContent =
	<M>(h: HtmlBuilder<M>, entry: ChannelEntry, sections: ReadonlyArray<Section>) =>
	(key: string): ReadonlyArray<Html | string> => {
		const id = rowMenuId(entry.channel.id)
		const text = (value: string, className?: string) => menuLabel(h, id, key, value, className)
		const { member } = entry
		if (key === "mute")
			return [
				member.isMuted
					? IconVolume(h, { className: "size-4" })
					: IconVolumeMute(h, { className: "size-4" }),
				text(member.isMuted ? "Unmute" : "Mute"),
			]
		if (key === "favorite")
			return [
				IconStar(h, {
					className: member.isFavorite ? "size-4 text-favorite" : "size-4 text-muted-fg",
				}),
				text(member.isFavorite ? "Unfavorite" : "Favorite"),
			]
		if (key === "move") return [IconFolderPlus(h, { className: "size-4" }), text("Move to section")]
		if (key === "settings") return [IconGear(h), text("Settings")]
		if (key === "delete") return [IconTrash(h), text("Delete")]
		if (key === "leave") return [IconLeave(h), text("Leave", "text-destructive")]
		if (key === DEFAULT_SECTION_KEY) return [text("Channels (Default)")]
		const section = sections.find((candidate) => sectionKeyOf(candidate.id) === key)
		return section ? [text(section.name)] : []
	}

/** `ChannelItem`'s `<Menu>`: the dots trigger and `MenuContent placement="right top" className="w-42"`. */
export const rowMenuView = <M>(
	h: HtmlBuilder<M>,
	options: Readonly<{
		menu: Menu.Model
		entry: ChannelEntry
		sections: ReadonlyArray<Section>
		canDelete: boolean
		toMessage: (message: Menu.Message) => M
	}>,
): Html =>
	h.submodel({
		slotId: options.menu.id,
		model: options.menu,
		view: menuView,
		viewInputs: {
			entries: rowMenuEntries(options.sections, options.canDelete),
			toTrigger: (attributes: ReadonlyArray<ChildAttribute>, overlay: Html) =>
				button(
					h,
					{
						intent: "plain",
						size: "sq-xs",
						className: "size-5 text-muted-fg",
						attributes: [
							h.Attribute("data-slot", "menu-trigger"),
							h.AriaLabel(
								options.entry.channel.type === "single" ||
									options.entry.channel.type === "direct"
									? "Conversation options"
									: "Channel options",
							),
							...attributes,
						],
					},
					[IconDots(h, { className: "size-4" }), overlay],
				),
			content: rowMenuContent(h, options.entry, options.sections),
			className: "w-42",
			itemClassName: (key) =>
				key === sectionKeyOf(options.entry.channel.sectionId) ? "bg-accent" : undefined,
		},
		toParentMessage: options.toMessage,
	})

/** The accessible name of a section's single-action "+" button (the same words as its menu item). */
export const sectionActionLabel = (action: SectionAction): string =>
	action === "create-channel"
		? "Create new channel"
		: action === "join-channel"
			? "Join existing channel"
			: "Start a conversation"

const sectionMenuContent =
	<M>(h: HtmlBuilder<M>, id: string) =>
	(key: string): ReadonlyArray<Html | string> => {
		const text = (value: string) => menuLabel(h, id, key, value)
		if (key === "create-channel") return [IconCirclePlus(h), text("Create new channel")]
		if (key === "join-channel") return [IconHashtag(h), text("Join existing channel")]
		if (key === "create-dm") return [IconPlus(h), text("Start a conversation")]
		if (key === "delete-section") return [IconTrash(h), text("Delete section")]
		return []
	}

/** `SectionGroup`'s "+" `<Menu>` (several actions or a deletable section). */
export const sectionMenuView = <M>(
	h: HtmlBuilder<M>,
	options: Readonly<{
		menu: Menu.Model
		entries: ReadonlyArray<Menu.Entry>
		toMessage: (message: Menu.Message) => M
	}>,
): Html =>
	h.submodel({
		slotId: options.menu.id,
		model: options.menu,
		view: menuView,
		viewInputs: {
			entries: options.entries,
			toTrigger: (attributes: ReadonlyArray<ChildAttribute>, overlay: Html) =>
				button(
					h,
					{
						intent: "plain",
						isCircle: true,
						size: "sq-xs",
						attributes: [h.AriaLabel("Section actions"), ...attributes],
					},
					[IconPlus(h), overlay],
				),
			content: sectionMenuContent(h, options.menu.id),
		},
		toParentMessage: options.toMessage,
	})
