"use client"

import type { ChannelSectionId, OrganizationId, UserId } from "@hazel/schema"
import { IconChevronUpDown } from "~/components/icons/icon-chevron-up-down"
import { and, eq, isNull, or, useLiveQuery } from "@tanstack/react-db"
import { Fragment, useMemo } from "react"
import { Button as PrimitiveButton } from "react-aria-components"
import { useModal } from "~/atoms/modal-atoms"
import IconHashtag from "~/components/icons/icon-hashtag"
import IconMagnifier from "~/components/icons/icon-magnifier-3"
import { ChannelItem } from "~/components/sidebar/channel-item"
import { DmChannelItem } from "~/components/sidebar/dm-channel-item"
import { FavoriteSection } from "~/components/sidebar/favorite-section"
import { SectionGroup } from "~/components/sidebar/section-group"
import { ThreadItem } from "~/components/sidebar/thread-item"
import { SwitchServerMenu } from "~/components/sidebar/switch-server-menu"
import { UserMenu } from "~/components/sidebar/user-menu"
import { Avatar } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
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
import {
	channelCollection,
	channelMemberCollection,
	channelSectionCollection,
} from "~/db/collections"
import { useActiveThreads } from "~/db/hooks"
import { useOrganization } from "~/hooks/use-organization"
import { useAuth } from "~/lib/auth"
import IconCirclePlus from "../icons/icon-circle-plus"
import IconEmoji1 from "../icons/icon-emoji-1"
import { IconFolderPlus } from "../icons/icon-folder-plus"
import IconGear from "../icons/icon-gear"
import IconIntegratio from "../icons/icon-integratio-"
import IconPlus from "../icons/icon-plus"
import { IconServers } from "../icons/icon-servers"
import IconUsers from "../icons/icon-users"
import IconUsersPlus from "../icons/icon-users-plus"

interface ChannelGroupProps {
	organizationId: OrganizationId
	sectionId: ChannelSectionId | null
	threadsByParent: ReturnType<typeof useActiveThreads>["threadsByParent"]
}

const ChannelGroupContent = ({ organizationId, sectionId, threadsByParent }: ChannelGroupProps) => {
	const { user } = useAuth()

	const { data: userChannels } = useLiveQuery(
		(q) => {
			let query = q
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
		return userChannels.map((row) => ({ channel: row.channel, member: row.member }))
	}, [userChannels])

	return (
		<>
			{channels.map(({ channel, member }) => (
				<Fragment key={channel.id}>
					<ChannelItem channel={channel} member={member} />
					{threadsByParent
						.get(channel.id)
						?.map(({ channel: thread, member: threadMember }) => (
							<ThreadItem key={thread.id} thread={thread} member={threadMember} />
						))}
				</Fragment>
			))}
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
					and(
						eq(qb.section.organizationId, organizationId || ""),
						isNull(qb.section.deletedAt),
					),
				)
				.orderBy(({ section }) => section.order, "asc"),
		[organizationId],
	)

	const sortedSections = useMemo(() => {
		if (!sections) return []
		return sections
	}, [sections])

	return (
		<>
			<Sidebar collapsible="none" className="flex flex-1">
				<SidebarHeader className="border-b py-4">
					<Menu>
						<PrimitiveButton className="relative flex items-center justify-between gap-x-2 font-semibold outline-hidden focus-visible:ring focus-visible:ring-primary">
							<div className="flex w-full items-center gap-1">
								<span className="flex gap-x-2 font-medium text-sm/6">
									<Avatar
										isSquare
										size="sm"
										src={
											organization?.logoUrl ||
											`https://avatar.vercel.sh/${organizationId}`
										}
									/>
									{organization?.name}
								</span>
								<IconChevronUpDown className="ml-auto size-4 text-muted-fg" />
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
										<MenuItemLink to="/$orgSlug/settings" params={{ orgSlug: slug }}>
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
								<SectionGroup
									sectionId="default"
									name="Channels"
									onCreateChannel={() => newChannelModal.open()}
									onJoinChannel={() => joinChannelModal.open()}
								>
									<ChannelGroupContent
										organizationId={organizationId}
										sectionId={null}
										threadsByParent={threadsByParent}
									/>
								</SectionGroup>

								{/* Custom sections */}
								{sortedSections.map((section) => (
									<SectionGroup
										key={section.id}
										sectionId={section.id}
										name={section.name}
										onCreateChannel={() => newChannelModal.open()}
										onJoinChannel={() => joinChannelModal.open()}
										isEditable
									>
										<ChannelGroupContent
											organizationId={organizationId}
											sectionId={section.id}
											threadsByParent={threadsByParent}
										/>
									</SectionGroup>
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
		</>
	)
}
