"use client"
import { useState } from "react"
import IconChatChatting1 from "~/components/icons/IconChatChatting1"
import IconGridDashboard01DuoSolid from "~/components/icons/IconGridDashboard01DuoSolid"
import IconGridDashboard01Stroke from "~/components/icons/IconGridDashboard01Stroke"
import IconSettings01Stroke from "~/components/icons/IconSettings01Stroke"
import {
	CommandMenu,
	CommandMenuItem,
	CommandMenuLabel,
	CommandMenuList,
	CommandMenuSearch,
	CommandMenuSection,
	CommandMenuShortcut,
} from "~/components/ui/command-menu"

export function CommandPalette() {
	const [isOpen, setIsOpen] = useState(false)
	return (
		<CommandMenu shortcut="k" isOpen={isOpen} onOpenChange={setIsOpen}>
			<CommandMenuSearch placeholder="Where would you like to go?" />
			<CommandMenuList>
				<CommandMenuSection>
					<CommandMenuItem href="#" textValue="all channels">
						<IconChatChatting1 />
						<CommandMenuLabel>All channels</CommandMenuLabel>
					</CommandMenuItem>
					<CommandMenuItem href="#" textValue="members">
						<IconGridDashboard01Stroke />
						<CommandMenuLabel>Members</CommandMenuLabel>
					</CommandMenuItem>
					<CommandMenuItem href="#" textValue="settings">
						<IconSettings01Stroke />
						<CommandMenuLabel>Settings</CommandMenuLabel>
					</CommandMenuItem>
				</CommandMenuSection>
			</CommandMenuList>
		</CommandMenu>
	)
}
