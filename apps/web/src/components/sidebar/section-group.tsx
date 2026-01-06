"use client"

import { useAtomSet, useAtomValue } from "@effect-atom/atom-react"
import type { ChannelSectionId } from "@hazel/schema"
import type { ReactNode } from "react"
import { sectionCollapsedAtomFamily, toggleSectionCollapsed } from "~/atoms/section-collapse-atoms"
import { Button } from "~/components/ui/button"
import { Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator } from "~/components/ui/menu"
import { SidebarSection } from "~/components/ui/sidebar"
import { Strong } from "~/components/ui/text"
import { deleteChannelSectionAction, updateChannelSectionAction } from "~/db/actions"
import { toastExit } from "~/lib/toast-exit"
import IconChevronDown from "../icons/icon-chevron-down"
import IconPlus from "../icons/icon-plus"
import IconTrash from "../icons/icon-trash"

interface SectionGroupProps {
	sectionId: ChannelSectionId | "default" | "dms"
	name: string
	onCreateChannel?: () => void
	onJoinChannel?: () => void
	onCreateDm?: () => void
	children: ReactNode
	/** Whether this section can be edited/deleted (custom sections only) */
	isEditable?: boolean
}

export function SectionGroup({
	sectionId,
	name,
	onCreateChannel,
	onJoinChannel,
	onCreateDm,
	children,
	isEditable = false,
}: SectionGroupProps) {
	const isCollapsed = useAtomValue(sectionCollapsedAtomFamily(sectionId))

	const deleteSection = useAtomSet(deleteChannelSectionAction, {
		mode: "promiseExit",
	})

	const handleToggle = () => {
		toggleSectionCollapsed(sectionId)
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

	return (
		<SidebarSection>
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
								<IconPlus />
								<MenuLabel>Create new channel</MenuLabel>
							</MenuItem>
						)}
						{onJoinChannel && (
							<MenuItem onAction={onJoinChannel}>
								<IconPlus />
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
			{!isCollapsed && children}
		</SidebarSection>
	)
}
