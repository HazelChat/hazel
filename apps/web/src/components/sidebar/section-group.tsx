"use client"

import { useAtom, useAtomSet, useAtomValue } from "@effect-atom/atom-react"
import type { ChannelId, ChannelSectionId } from "@hazel/schema"
import type { ReactNode } from "react"
import { useDragAndDrop } from "react-aria-components"
import { collapsedSectionsAtom, sectionCollapsedAtomFamily } from "~/atoms/section-collapse-atoms"
import { CHANNEL_DRAG_TYPE } from "~/components/sidebar/channel-item"
import { Button } from "~/components/ui/button"
import { Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator } from "~/components/ui/menu"
import { SidebarSection } from "~/components/ui/sidebar"
import { Strong } from "~/components/ui/text"
import { deleteChannelSectionAction, moveChannelToSectionAction } from "~/db/actions"
import { toastExit } from "~/lib/toast-exit"
import IconChevronDown from "../icons/icon-chevron-down"
import IconCirclePlus from "../icons/icon-circle-plus"
import IconHashtag from "../icons/icon-hashtag"
import IconPlus from "../icons/icon-plus"
import IconTrash from "../icons/icon-trash"

export interface ChannelDragData {
	channelId: string
	channelName: string
	currentSectionId: string | null
}

interface SectionGroupProps {
	sectionId: ChannelSectionId | "default" | "dms"
	name: string
	onCreateChannel?: () => void
	onJoinChannel?: () => void
	onCreateDm?: () => void
	children: ReactNode
	/** Map of channel IDs to their data, used for drag operations */
	channelDataMap?: Map<string, ChannelDragData>
	/** Whether this section can be edited/deleted (custom sections only) */
	isEditable?: boolean
	/** Channel IDs that have nested children (threads) - these will be expanded by default */
	expandedChannelIds?: string[]
}

export function SectionGroup({
	sectionId,
	name,
	onCreateChannel,
	onJoinChannel,
	onCreateDm,
	children,
	channelDataMap,
	isEditable = false,
	expandedChannelIds,
}: SectionGroupProps) {
	const isCollapsed = useAtomValue(sectionCollapsedAtomFamily(sectionId))
	const [, setCollapsedSections] = useAtom(collapsedSectionsAtom)

	const deleteSection = useAtomSet(deleteChannelSectionAction, {
		mode: "promiseExit",
	})
	const moveChannelToSection = useAtomSet(moveChannelToSectionAction, {
		mode: "promiseExit",
	})

	const handleChannelDrop = async (items: import("react-aria-components").DropItem[]) => {
		if (sectionId === "dms") return
		for (const item of items) {
			if (item.kind === "text") {
				const data: ChannelDragData = JSON.parse(await item.getText(CHANNEL_DRAG_TYPE))
				const targetSectionId = sectionId === "default" ? null : sectionId
				if (data.currentSectionId === targetSectionId) continue
				await toastExit(
					moveChannelToSection({
						channelId: data.channelId as ChannelId,
						sectionId: targetSectionId,
					}),
					{
						loading: "Moving channel...",
						success: `Moved "${data.channelName}" to ${name}`,
						customErrors: {},
					},
				)
			}
		}
	}

	const { dragAndDropHooks } = useDragAndDrop({
		getItems(keys) {
			return [...keys].map((key) => {
				const keyStr = String(key)
				const channelData = channelDataMap?.get(keyStr)
				return {
					[CHANNEL_DRAG_TYPE]: JSON.stringify({
						channelId: keyStr,
						channelName: channelData?.channelName ?? "",
						currentSectionId: channelData?.currentSectionId ?? null,
					} satisfies ChannelDragData),
				}
			})
		},
		acceptedDragTypes: sectionId === "dms" ? [] : [CHANNEL_DRAG_TYPE],
		onInsert: (e) => handleChannelDrop(e.items),
		onRootDrop: (e) => handleChannelDrop(e.items),
	})

	const handleToggle = () => {
		setCollapsedSections((prev) => ({
			...prev,
			[sectionId]: !prev[sectionId],
		}))
	}

	const handleDelete = async () => {
		if (sectionId === "default" || sectionId === "dms") return

		await toastExit(deleteSection({ sectionId }), {
			loading: "Deleting section...",
			success: "Section deleted",
			customErrors: {
				ChannelSectionNotFoundError: () => ({
					title: "Section not found",
					description: "This section may have already been deleted.",
					isRetryable: false,
				}),
			},
		})
	}

	const headerContent = (
		<div className="col-span-full flex items-center justify-between gap-x-2 pl-2.5 text-muted-fg text-xs/5">
			<button
				type="button"
				onClick={handleToggle}
				className="flex items-center gap-1 hover:text-fg transition-colors"
			>
				<IconChevronDown
					className={`size-3 transition-transform ${isCollapsed ? "-rotate-90" : ""}`}
				/>
				<Strong>{name}</Strong>
			</button>
			<Menu>
				<Button intent="plain" isCircle size="sq-sm">
					<IconPlus />
				</Button>
				<MenuContent>
					{onCreateChannel && (
						<MenuItem onAction={onCreateChannel}>
							<IconCirclePlus />
							<MenuLabel>Create new channel</MenuLabel>
						</MenuItem>
					)}
					{onJoinChannel && (
						<MenuItem onAction={onJoinChannel}>
							<IconHashtag />
							<MenuLabel>Join existing channel</MenuLabel>
						</MenuItem>
					)}
					{onCreateDm && (
						<MenuItem onAction={onCreateDm}>
							<IconPlus />
							<MenuLabel>Start a conversation</MenuLabel>
						</MenuItem>
					)}
					{isEditable && (
						<>
							<MenuSeparator />
							<MenuItem onAction={handleDelete} className="text-danger">
								<IconTrash />
								<MenuLabel>Delete section</MenuLabel>
							</MenuItem>
						</>
					)}
				</MenuContent>
			</Menu>
		</div>
	)

	// Use tree mode for all sections
	// Tree enables nested items (channels with threads) and works with SidebarTreeItem
	const treeConfig = {
		"aria-label": `${name} channels`,
		dragAndDropHooks: sectionId !== "dms" ? dragAndDropHooks : undefined,
		defaultExpandedKeys: expandedChannelIds,
	}

	return (
		<SidebarSection header={headerContent} tree={treeConfig}>
			{!isCollapsed && children}
		</SidebarSection>
	)
}
