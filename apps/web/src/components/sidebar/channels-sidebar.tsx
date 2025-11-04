"use client"

import type { OrganizationId } from "@hazel/db/schema"
import { ChevronUpDownIcon } from "@heroicons/react/20/solid"
import { and, eq, or, useLiveQuery } from "@tanstack/react-db"
import { useMemo, useState } from "react"
import { Button as PrimitiveButton } from "react-aria-components"
import IconHashtag from "~/components/icons/icon-hashtag"
import IconMagnifier from "~/components/icons/icon-magnifier-3"
import { CreateChannelModal } from "~/components/modals/create-channel-modal"
import { CreateDmModal } from "~/components/modals/create-dm-modal"
import { CreateOrganizationModal } from "~/components/modals/create-organization-modal"
import { EmailInviteModal } from "~/components/modals/email-invite-modal"
import { JoinChannelModal } from "~/components/modals/join-channel-modal"
import { ChannelItem } from "~/components/sidebar/channel-item"
import { DmChannelItem } from "~/components/sidebar/dm-channel-item"
import { FavoriteSection } from "~/components/sidebar/favorite-section"
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
import { Strong } from "~/components/ui/text"
import { channelCollection, channelMemberCollection } from "~/db/collections"
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

const ChannelGroup = (props: {
	organizationId: OrganizationId
	onCreateChannel: () => void
	onJoinChannel: () => void
}) => {
	const { user } = useAuth()
	const { slug } = useOrganization()

	const { data: userChannels } = useLiveQuery(
		(q) =>
			q
				.from({ channel: channelCollection })
				.innerJoin({ member: channelMemberCollection }, ({ channel, member }) =>
					eq(member.channelId, channel.id),
				)
				.where((q) =>
					and(
						eq(q.channel.organizationId, props.organizationId),
						or(eq(q.channel.type, "public"), eq(q.channel.type, "private")),
						eq(q.member.userId, user?.id || ""),
						eq(q.member.isHidden, false),
						eq(q.member.isFavorite, false),
					),
				)
				.orderBy(({ channel }) => channel.createdAt, "asc"),
		[user?.id, props.organizationId],
	)

	const channels = useMemo(() => {
		if (!userChannels) return []
		return userChannels.map((row) => ({ channel: row.channel, member: row.member }))
	}, [userChannels])

	if (!slug) return null

	return (
		<SidebarSection>
			<div className="col-span-full flex items-center justify-between gap-x-2 pl-2.5 text-muted-fg text-xs/5">
				<Strong>Channels</Strong>
				<Menu>
					<Button intent="plain" isCircle size="sq-sm">
						<IconPlus />
					</Button>
					<MenuContent>
						<MenuItem onAction={props.onCreateChannel}>
							<IconCirclePlus />
							<MenuLabel>Create new channel</MenuLabel>
						</MenuItem>
						<MenuItem onAction={props.onJoinChannel}>
							<IconHashtag />
							<MenuLabel>Join existing channel</MenuLabel>
						</MenuItem>
					</MenuContent>
				</Menu>
			</div>
			{channels.map(({ channel, member }) => (
				<ChannelItem key={channel.id} channel={channel} member={member} />
			))}
		</SidebarSection>
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
		<SidebarSection>
			<div className="col-span-full flex items-center justify-between gap-x-2 pl-2.5 text-muted-fg text-xs/5">
				<Strong>Direct Messages</Strong>
				<Button intent="plain" isCircle size="sq-sm" onPress={props.onCreateDm}>
					<IconPlus />
				</Button>
			</div>
			{dmChannels.map((channel) => (
				<DmChannelItem key={channel.id} channelId={channel.id} />
			))}
		</SidebarSection>
	)
}

export function ChannelsSidebar(props: { openChannelsBrowser: () => void }) {
	const { isMobile } = useSidebar()
	const { organizationId, organization, slug } = useOrganization()
	const [modalType, setModalType] = useState<"create" | "join" | "dm" | "invite" | null>(null)

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
								<ChevronUpDownIcon className="ml-auto size-4 text-muted-fg" />
							</div>
						</PrimitiveButton>
						<MenuContent className="min-w-(--trigger-width)">
							{isMobile ? (
								<SwitchServerMenu />
							) : (
								<>
									<MenuSection>
										<MenuItem onAction={() => setModalType("invite")}>
											<IconUsersPlus />
											<MenuLabel>Invite people</MenuLabel>
										</MenuItem>
										<MenuItem href="/">
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
											<SwitchServerMenu />
										</MenuContent>
									</MenuSubMenu>

									<MenuSeparator />

									<MenuSection>
										<MenuItem onAction={() => setModalType("create")}>
											<IconCirclePlus />
											<MenuLabel>Create channel</MenuLabel>
										</MenuItem>
										<MenuItem href="/">
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
								<Keyboard className="-translate-y-1/2 absolute top-1/2 right-2 font-mono text-muted-fg text-xs">
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
								<ChannelGroup
									organizationId={organizationId}
									onCreateChannel={() => setModalType("create")}
									onJoinChannel={() => setModalType("join")}
								/>
								<DmChannelGroup
									organizationId={organizationId}
									onCreateDm={() => setModalType("dm")}
								/>
							</>
						)}
					</SidebarSectionGroup>
				</SidebarContent>
				<SidebarFooter className="flex flex-row justify-between gap-4 group-data-[state=collapsed]:flex-col">
					<UserMenu />
				</SidebarFooter>
			</Sidebar>
			{modalType === "create" && (
				<CreateChannelModal isOpen={true} onOpenChange={(isOpen) => !isOpen && setModalType(null)} />
			)}
			{modalType === "join" && (
				<JoinChannelModal isOpen={true} onOpenChange={(isOpen) => !isOpen && setModalType(null)} />
			)}
			{modalType === "dm" && (
				<CreateDmModal isOpen={true} onOpenChange={(isOpen) => !isOpen && setModalType(null)} />
			)}
			{modalType === "invite" && (
				<EmailInviteModal isOpen={true} onOpenChange={(isOpen) => !isOpen && setModalType(null)} />
			)}
			<CreateOrganizationModal />
		</>
	)
}
