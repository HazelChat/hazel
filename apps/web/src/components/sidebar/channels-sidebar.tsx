"use client"

import type { ChannelSectionId, OrganizationId, UserId } from "@hazel/schema"
import { and, eq, isNull, or, useLiveQuery } from "@tanstack/react-db"
import { useMemo } from "react"
import { Button as PrimitiveButton } from "react-aria-components"
import { useModal } from "~/atoms/modal-atoms"
import { IconChevronUpDown } from "~/components/icons/icon-chevron-up-down"
import IconMagnifier from "~/components/icons/icon-magnifier-3"
import { ChannelItem } from "~/components/sidebar/channel-item"
import { DiscoverableChannels } from "~/components/sidebar/discoverable-channels"
import { DmChannelItem } from "~/components/sidebar/dm-channel-item"
import { FavoriteSection } from "~/components/sidebar/favorite-section"
import { SectionGroup } from "~/components/sidebar/section-group"
import { SwitchServerMenu } from "~/components/sidebar/switch-server-menu"
import { UserMenu } from "~/components/sidebar/user-menu"
import { Avatar } from "~/components/ui/avatar"
import { Keyboard } from "~/components/ui/keyboard"
import {
	Menu,
	MenuContent,
	MenuItem,
	MenuItemLink,
	MenuLabel,
	MenuSection,
	MenuSeparator,
	MenuSubMenu,
} from "~/components/ui/menu"
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarItem,
	SidebarLabel,
	SidebarLink,
	SidebarSection,
	SidebarSectionGroup,
	useSidebar,
} from "~/components/ui/sidebar"
import { channelCollection, channelMemberCollection, channelSectionCollection } from "~/db/collections"
import { useActiveThreads } from "~/db/hooks"
import { useOrganization } from "~/hooks/use-organization"
import { useAuth } from "~/lib/auth"
import IconCirclePlus from "../icons/icon-circle-plus"
import IconEmoji1 from "../icons/icon-emoji-1"
import { IconFolderPlus } from "../icons/icon-folder-plus"
import IconGear from "../icons/icon-gear"
import IconIntegratio from "../icons/icon-integratio-"
import { IconServers } from "../icons/icon-servers"
import IconUsers from "../icons/icon-users"
import IconUsersPlus from "../icons/icon-users-plus"
import { isTauriMacOS } from "~/lib/tauri"

interface ChannelSectionProps {
	organizationId: OrganizationId
	sectionId: ChannelSectionId | null
	sectionDisplayId: ChannelSectionId | "default"
	sectionName: string
	onCreateChannel: () => void
	onJoinChannel: () => void
	isEditable?: boolean
	/** Map of parent channel IDs to their threads */
	threadsByParent?: Map<
		string,
		Array<{
			channel: Omit<import("@hazel/db/schema").Channel, "updatedAt"> & { updatedAt: Date | null }
			member: import("@hazel/db/schema").ChannelMember
		}>
	>
	/** Available sections for "move to section" menu */
	sections?: Array<{ id: ChannelSectionId; name: string }>
}

const ChannelSection = ({
	organizationId,
	sectionId,
	sectionDisplayId,
	sectionName,
	onCreateChannel,
	onJoinChannel,
	isEditable = false,
	threadsByParent,
	sections,
}: ChannelSectionProps) => {
	const { user } = useAuth()

	const { data: userChannels } = useLiveQuery(
		(q) => {
			const query = q
				.from({ channel: channelCollection })
				.innerJoin({ member: channelMemberCollection }, ({ channel, member }) =>
					eq(member.channelId, channel.id),
				)
				.where((qb) =>
					and(
						eq(qb.channel.organizationId, organizationId),
						or(eq(qb.channel.type, "public"), eq(qb.channel.type, "private")),
						eq(qb.member.userId, user?.id || ""),
						eq(qb.member.isHidden, false),
						eq(qb.member.isFavorite, false),
						sectionId === null
							? isNull(qb.channel.sectionId)
							: eq(qb.channel.sectionId, sectionId),
					),
				)
				.orderBy(({ channel }) => channel.createdAt, "asc")

			return query
		},
		[user?.id, organizationId, sectionId],
	)

	const channels = useMemo(() => {
		if (!userChannels) return []
		return userChannels.map((row) => ({
			channel: row.channel,
			member: row.member,
		}))
	}, [userChannels])

	// Create channelDataMap for drag operations
	const channelDataMap = useMemo(() => {
		const map = new Map<
			string,
			{
				channelId: string
				channelName: string
				currentSectionId: string | null
			}
		>()
		for (const { channel } of channels) {
			map.set(channel.id, {
				channelId: channel.id,
				channelName: channel.name,
				currentSectionId: channel.sectionId,
			})
		}
		return map
	}, [channels])

	// Compute channel IDs that have threads (to expand them by default in the tree)
	const expandedChannelIds = useMemo(() => {
		if (!threadsByParent) return []
		return channels
			.filter(({ channel }) => {
				const threads = threadsByParent.get(channel.id)
				return threads && threads.length > 0
			})
			.map(({ channel }) => channel.id)
	}, [channels, threadsByParent])

	return (
		<>
			<SectionGroup
				sectionId={sectionDisplayId}
				name={sectionName}
				onCreateChannel={onCreateChannel}
				onJoinChannel={onJoinChannel}
				channelDataMap={channelDataMap}
				isEditable={isEditable}
				expandedChannelIds={expandedChannelIds}
			>
				{channels.map(({ channel, member }) => (
					<ChannelItem
						key={channel.id}
						channel={channel}
						member={member}
						threads={threadsByParent?.get(channel.id)}
						sections={sections}
					/>
				))}
			</SectionGroup>
			{sectionId === null && (
				<DiscoverableChannels organizationId={organizationId} onBrowseAll={onJoinChannel} />
			)}
		</>
	)
}

const DmChannelGroup = (props: { organizationId: OrganizationId; onCreateDm: () => void }) => {
	const { user } = useAuth()

	const { data: userDmChannels } = useLiveQuery(
		(q) =>
			q
				.from({ channel: channelCollection })
				.innerJoin({ member: channelMemberCollection }, ({ channel, member }) =>
					eq(member.channelId, channel.id),
				)
				.where((q) =>
					and(
						eq(q.channel.organizationId, props.organizationId),
						or(eq(q.channel.type, "direct"), eq(q.channel.type, "single")),
						eq(q.member.userId, user?.id || ""),
						eq(q.member.isHidden, false),
						eq(q.member.isFavorite, false),
					),
				)
				.orderBy(({ channel }) => channel.createdAt, "asc"),
		[user?.id, props.organizationId],
	)

	const dmChannels = useMemo(() => {
		if (!userDmChannels) return []
		return userDmChannels.map((row) => row.channel)
	}, [userDmChannels])

	return (
		<SectionGroup sectionId="dms" name="Direct Messages" onCreateDm={props.onCreateDm}>
			{dmChannels.map((channel) => (
				<DmChannelItem key={channel.id} channelId={channel.id} />
			))}
		</SectionGroup>
	)
}

export function ChannelsSidebar(props: { openChannelsBrowser: () => void }) {
	const { isMobile } = useSidebar()
	const { organizationId, organization, slug } = useOrganization()
	const { user } = useAuth()
	const { threadsByParent } = useActiveThreads(organizationId ?? null, user?.id as UserId | undefined)
	const hasTauriTitlebar = isTauriMacOS()

	// Modal hooks
	const createOrgModal = useModal("create-organization")
	const emailInviteModal = useModal("email-invite")
	const newChannelModal = useModal("new-channel")
	const joinChannelModal = useModal("join-channel")
	const createDmModal = useModal("create-dm")
	const createSectionModal = useModal("create-section")

	// Query channel sections for this organization
	const { data: sections } = useLiveQuery(
		(q) =>
			q
				.from({ section: channelSectionCollection })
				.where((qb) =>
					and(eq(qb.section.organizationId, organizationId || ""), isNull(qb.section.deletedAt)),
				)
				.orderBy(({ section }) => section.order, "asc"),
		[organizationId],
	)

	return (
		<Sidebar collapsible="none" className="flex flex-1">
			<SidebarHeader
				data-tauri-drag-region
				className={`border-b ${hasTauriTitlebar ? "pt-14 relative before:absolute before:top-10 before:left-0 before:right-0 before:h-px before:bg-sidebar-border" : "h-14"}`}
			>
				<Menu>
					<PrimitiveButton className="group/switcher relative flex items-center justify-between gap-x-2 font-semibold outline-hidden text-fg/80 hover:text-fg transition-colors focus-visible:ring focus-visible:ring-primary">
						<div className="flex w-full items-center gap-1">
							<span className="flex gap-x-2 font-medium text-sm/6">
								<Avatar
									isSquare
									size="sm"
									src={organization?.logoUrl ?? undefined}
									seed={organization?.name ?? undefined}
								/>
								{organization?.name}
							</span>
							<IconChevronUpDown className="ml-auto size-4 text-muted-fg group-hover/switcher:text-fg transition-colors" />
						</div>
					</PrimitiveButton>
					<MenuContent className="min-w-(--trigger-width)">
						{isMobile ? (
							<SwitchServerMenu onCreateOrganization={() => createOrgModal.open()} />
						) : (
							<>
								<MenuSection>
									<MenuItem onAction={() => emailInviteModal.open()}>
										<IconUsersPlus />
										<MenuLabel>Invite people</MenuLabel>
									</MenuItem>
									<MenuItem
										href={{
											to: "/$orgSlug/settings/team",
											params: { orgSlug: slug },
										}}
									>
										<IconUsers />
										<MenuLabel>Manage members</MenuLabel>
									</MenuItem>
								</MenuSection>

								<MenuSubMenu>
									<MenuItem>
										<IconServers />
										<MenuLabel>Switch Server</MenuLabel>
									</MenuItem>
									<MenuContent>
										<SwitchServerMenu
											onCreateOrganization={() => createOrgModal.open()}
										/>
									</MenuContent>
								</MenuSubMenu>

								<MenuSeparator />

								<MenuSection>
									<MenuItem onAction={() => newChannelModal.open()}>
										<IconCirclePlus />
										<MenuLabel>Create channel</MenuLabel>
									</MenuItem>
									<MenuItem onAction={() => createSectionModal.open()}>
										<IconFolderPlus />
										<MenuLabel>Create category</MenuLabel>
									</MenuItem>
								</MenuSection>

								<MenuSeparator />

								<MenuSection>
									<MenuItemLink to="/$orgSlug/settings" params={{ orgSlug: slug }}>
										<IconGear />
										<MenuLabel>Server settings</MenuLabel>
									</MenuItemLink>
									<MenuItemLink
										to="/$orgSlug/settings/custom-emojis"
										params={{ orgSlug: slug }}
									>
										<IconEmoji1 />
										<MenuLabel>Custom emojis</MenuLabel>
									</MenuItemLink>
									<MenuItemLink
										to="/$orgSlug/settings/integrations"
										params={{ orgSlug: slug }}
									>
										<IconIntegratio />
										<MenuLabel>Integrations</MenuLabel>
									</MenuItemLink>
								</MenuSection>
							</>
						)}
					</MenuContent>
				</Menu>
			</SidebarHeader>
			<SidebarContent>
				<SidebarSectionGroup>
					<SidebarSection aria-label="Goto">
						<SidebarItem onPress={props.openChannelsBrowser}>
							<IconMagnifier />
							<SidebarLabel>Browse channels</SidebarLabel>
							<Keyboard className="absolute top-1/2 right-2 -translate-y-1/2 font-mono text-muted-fg text-xs">
								⌘K
							</Keyboard>
						</SidebarItem>
						<SidebarItem>
							<SidebarLink
								to="/$orgSlug"
								params={{ orgSlug: slug }}
								activeOptions={{
									exact: true,
								}}
								activeProps={{
									className: "bg-sidebar-accent font-medium text-sidebar-accent-fg",
								}}
							>
								<IconUsers />
								<SidebarLabel>Members</SidebarLabel>
							</SidebarLink>
						</SidebarItem>
					</SidebarSection>

					{organizationId && (
						<>
							<FavoriteSection organizationId={organizationId} />

							{/* Default "Channels" section (channels with no section) */}
							<ChannelSection
								organizationId={organizationId}
								sectionId={null}
								sectionDisplayId="default"
								sectionName="Channels"
								onCreateChannel={() => newChannelModal.open()}
								onJoinChannel={() => joinChannelModal.open()}
								threadsByParent={threadsByParent}
								sections={sections ?? []}
							/>

							{/* Custom sections */}
							{(sections ?? []).map((section) => (
								<ChannelSection
									key={section.id}
									organizationId={organizationId}
									sectionId={section.id}
									sectionDisplayId={section.id}
									sectionName={section.name}
									onCreateChannel={() => newChannelModal.open()}
									onJoinChannel={() => joinChannelModal.open()}
									isEditable
									threadsByParent={threadsByParent}
									sections={sections ?? []}
								/>
							))}

							<DmChannelGroup
								organizationId={organizationId}
								onCreateDm={() => createDmModal.open()}
							/>
						</>
					)}
				</SidebarSectionGroup>
			</SidebarContent>
			<SidebarFooter className="flex flex-row justify-between gap-4 group-data-[state=collapsed]:flex-col">
				<UserMenu />
			</SidebarFooter>
		</Sidebar>
	)
}
