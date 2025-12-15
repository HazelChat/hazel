import type { ChannelCategory } from "@hazel/db/schema"
import type { ChannelCategoryId, OrganizationId } from "@hazel/schema"
import { and, eq, or, useLiveQuery } from "@tanstack/react-db"
import { useMemo, useState } from "react"
import { ChannelItem } from "~/components/sidebar/channel-item"
import { Button } from "~/components/ui/button"
import { Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator } from "~/components/ui/menu"
import {
	SidebarDisclosure,
	SidebarDisclosurePanel,
	SidebarDisclosureTrigger,
	SidebarLabel,
} from "~/components/ui/sidebar"
import { channelCollection, channelMemberCollection } from "~/db/collections"
import { useCategoryExpanded } from "~/hooks/use-category-expanded"
import { useAuth } from "~/lib/auth"
import IconCirclePlus from "../icons/icon-circle-plus"
import IconDots from "../icons/icon-dots"
import IconEdit from "../icons/icon-edit"
import { IconFolderOpen } from "../icons/icon-folder-open"
import IconTrash from "../icons/icon-trash"
import { DeleteCategoryModal } from "../modals/delete-category-modal"
import { RenameCategoryModal } from "../modals/rename-category-modal"

interface CategoryGroupProps {
	category: Omit<ChannelCategory, "updatedAt"> & { updatedAt: Date | null }
	organizationId: OrganizationId
	onCreateChannel: (categoryId: ChannelCategoryId) => void
}

export function CategoryGroup({ category, organizationId, onCreateChannel }: CategoryGroupProps) {
	const { user } = useAuth()
	const [isExpanded, setExpanded] = useCategoryExpanded(category.id)
	const [renameModalOpen, setRenameModalOpen] = useState(false)
	const [deleteModalOpen, setDeleteModalOpen] = useState(false)

	const { data: categoryChannels } = useLiveQuery(
		(q) =>
			q
				.from({ channel: channelCollection })
				.innerJoin({ member: channelMemberCollection }, ({ channel, member }) =>
					eq(member.channelId, channel.id),
				)
				.where((tables) =>
					and(
						eq(tables.channel.organizationId, organizationId),
						eq(tables.channel.categoryId, category.id),
						or(eq(tables.channel.type, "public"), eq(tables.channel.type, "private")),
						eq(tables.member.userId, user?.id || ""),
						eq(tables.member.isHidden, false),
						eq(tables.member.isFavorite, false),
					),
				)
				.orderBy(({ channel }) => channel.sortOrder ?? channel.createdAt, "asc"),
		[user?.id, organizationId, category.id],
	)

	const channels = useMemo(() => {
		if (!categoryChannels) return []
		return categoryChannels.map((row) => ({ channel: row.channel, member: row.member }))
	}, [categoryChannels])

	return (
		<>
			<SidebarDisclosure isExpanded={isExpanded} onExpandedChange={setExpanded}>
				<SidebarDisclosureTrigger className="group/category-trigger">
					<IconFolderOpen data-slot="icon" />
					<SidebarLabel>{category.name}</SidebarLabel>
					<Menu>
						<Button
							intent="plain"
							size="sq-xs"
							data-slot="menu-trigger"
							className="size-5 text-muted-fg"
						>
							<IconDots className="size-4" />
						</Button>
						<MenuContent placement="right top" className="w-42">
							<MenuItem onAction={() => onCreateChannel(category.id)}>
								<IconCirclePlus className="size-4" />
								<MenuLabel>Create channel</MenuLabel>
							</MenuItem>
							<MenuSeparator />
							<MenuItem onAction={() => setRenameModalOpen(true)}>
								<IconEdit className="size-4" />
								<MenuLabel>Rename</MenuLabel>
							</MenuItem>
							<MenuItem intent="danger" onAction={() => setDeleteModalOpen(true)}>
								<IconTrash className="size-4" />
								<MenuLabel>Delete</MenuLabel>
							</MenuItem>
						</MenuContent>
					</Menu>
				</SidebarDisclosureTrigger>
				<SidebarDisclosurePanel>
					{channels.map(({ channel, member }) => (
						<ChannelItem key={channel.id} channel={channel} member={member} organizationId={organizationId} />
					))}
				</SidebarDisclosurePanel>
			</SidebarDisclosure>

			{renameModalOpen && (
				<RenameCategoryModal
					category={category}
					isOpen={true}
					onOpenChange={(isOpen) => !isOpen && setRenameModalOpen(false)}
				/>
			)}

			{deleteModalOpen && (
				<DeleteCategoryModal
					category={category}
					isOpen={true}
					onOpenChange={(isOpen) => !isOpen && setDeleteModalOpen(false)}
				/>
			)}
		</>
	)
}
