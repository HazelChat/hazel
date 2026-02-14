"use client"

import { useCallback, useMemo } from "react"
import type { CommandPalettePageType } from "~/atoms/command-palette-state"
import { isFormPage } from "~/atoms/command-palette-state"
import { useCommandPalette } from "~/hooks/use-command-palette"
import { CommandMenu, CommandMenuList, CommandMenuSearch } from "../ui/command-menu"
import { CommandPaletteContext, type CommandPaletteContextValue } from "./command-palette-context"
import { AppearanceView, CreateChannelView, HomeView, JoinChannelView, StatusView } from "./pages"
import { SearchView } from "./search-view"

export interface CommandPaletteProps {
	isOpen?: boolean
	onOpenChange?: (open: boolean) => void
	initialPage?: CommandPalettePageType
}

export function CommandPalette(props: CommandPaletteProps) {
	const commandPalette = useCommandPalette()

	// Determine actual open state (controlled vs uncontrolled)
	const isOpen = props.isOpen ?? commandPalette.isOpen

	// Handle open change - sync with props and internal state
	const handleOpenChange = useCallback(
		(open: boolean) => {
			if (open) {
				commandPalette.open(props.initialPage || "home")
			} else {
				commandPalette.close()
			}
			props.onOpenChange?.(open)
		},
		[commandPalette, props],
	)

	// Handle ESC key - go back if possible, otherwise close
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Escape") {
				e.preventDefault()
				e.stopPropagation()
				if (commandPalette.canGoBack) {
					commandPalette.goBack()
				} else {
					handleOpenChange(false)
				}
			}
		},
		[commandPalette, handleOpenChange],
	)

	// Create context value
	const contextValue: CommandPaletteContextValue = useMemo(
		() => ({
			isOpen,
			currentPage: commandPalette.currentPage,
			canGoBack: commandPalette.canGoBack,
			open: commandPalette.open,
			close: () => handleOpenChange(false),
			navigateTo: commandPalette.navigateTo,
			goBack: commandPalette.goBack,
			updateSearchState: commandPalette.updateSearchState,
			updateCreateChannelState: commandPalette.updateCreateChannelState,
			updateJoinChannelState: commandPalette.updateJoinChannelState,
			updateInputValue: commandPalette.updateInputValue,
		}),
		[isOpen, commandPalette, handleOpenChange],
	)

	const currentPageType = commandPalette.currentPage.type
	const isCurrentPageForm = isFormPage(currentPageType)

	// Get input value for list pages
	const inputValue = useMemo(() => {
		const page = commandPalette.currentPage
		if (page.type === "home" || page.type === "status" || page.type === "appearance") {
			return page.inputValue
		}
		return ""
	}, [commandPalette.currentPage])

	// Get placeholder for search input
	const searchPlaceholder = useMemo(() => {
		switch (currentPageType) {
			case "status":
				return "Set your status..."
			case "appearance":
				return "Change appearance..."
			default:
				return "Where would you like to go?"
		}
	}, [currentPageType])

	return (
		<CommandPaletteContext value={contextValue}>
			<CommandMenu
				inputValue={inputValue}
				onInputChange={commandPalette.updateInputValue}
				isOpen={isOpen}
				onOpenChange={handleOpenChange}
				isFormPage={isCurrentPageForm}
				isKeyboardDismissDisabled={true}
				onKeyDown={handleKeyDown}
			>
				{isCurrentPageForm ? (
					// Form pages render their own header/content outside CommandMenuList
					<>
						{currentPageType === "search" && (
							<SearchView onClose={() => handleOpenChange(false)} />
						)}
						{currentPageType === "create-channel" && (
							<CreateChannelView
								onClose={() => handleOpenChange(false)}
								onBack={commandPalette.goBack}
							/>
						)}
						{currentPageType === "join-channel" && (
							<JoinChannelView
								onClose={() => handleOpenChange(false)}
								onBack={commandPalette.goBack}
							/>
						)}
					</>
				) : (
					// List pages use the search input and menu list
					<>
						<CommandMenuSearch placeholder={searchPlaceholder} />
						<CommandMenuList>
							{currentPageType === "home" && (
								<HomeView
									navigateToPage={commandPalette.navigateTo}
									onClose={() => handleOpenChange(false)}
								/>
							)}
							{currentPageType === "status" && (
								<StatusView onClose={() => handleOpenChange(false)} />
							)}
							{currentPageType === "appearance" && (
								<AppearanceView onClose={() => handleOpenChange(false)} />
							)}
						</CommandMenuList>
					</>
				)}
			</CommandMenu>
		</CommandPaletteContext>
	)
}
