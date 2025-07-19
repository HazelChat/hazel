import type { ComponentPropsWithRef, ReactNode } from "react"
import { Children, createContext, Fragment, useContext, useMemo, useRef, useState } from "react"
import type {
	AutocompleteProps,
	DialogTriggerProps,
	Key,
	ListBoxProps,
	ListBoxSectionProps,
	ModalOverlayProps,
} from "react-aria-components"
import {
	Autocomplete as AriaAutocomplete,
	Collection as AriaCollection,
	Dialog as AriaDialog,
	DialogTrigger as AriaDialogTrigger,
	ListBox as AriaListBox,
	ListBoxSection as AriaListBoxSection,
	Modal as AriaModal,
	ModalOverlay as AriaModalOverlay,
	TextField as AriaTextField,
	useFilter,
} from "react-aria-components"
import { useHotkeys } from "react-hotkeys-hook"
import { cx } from "@/utils/cx"
import { CommandInput } from "./base-components/command-input"
import { CommandMenuFooter } from "./base-components/command-menu-footer"
import { CommandMenuHeader } from "./base-components/command-menu-header"
import {
	CommandDropdownMenuItem,
	type CommandDropdownMenuItemProps,
} from "./base-components/command-menu-item"
import { parseHotkey } from "./parseHotkeys"
import { isDeepEqual, mergeRefs } from "./utils"

export type CommandMenuGroupType = { id: string; title?: string; items: CommandDropdownMenuItemProps[] }

interface CommandMenuContentProps
	extends Omit<ListBoxProps<CommandMenuGroupType>, "children" | "selectedKeys">,
		AutocompleteProps,
		DialogTriggerProps {
	placeholder?: string
	emptyState?: ReactNode
	wrapperClassName?: string
	items?: CommandMenuGroupType[]
	defaultItems?: CommandMenuGroupType[]
	sensitivity?: "base" | "accent" | "case" | "variant" | undefined
}

interface CommandMenuContextProps extends Omit<CommandMenuContentProps, "children"> {
	/**
	 * Whether the command menu has a footer. Used for
	 * adding an extra bottom padding to the list to account
	 * for the absolutely positioned footer at the bottom.
	 */
	hasFooter?: boolean
	/**
	 * The flattened items of the command menu.
	 */
	flatItems: CommandDropdownMenuItemProps[]
	/**
	 * The currently selected keys.
	 */
	selectedKeys: Iterable<Key>
	/**
	 * The function to set the currently selected keys.
	 */
	setSelectedKeys: (keys: Iterable<Key>) => void
}

const CommandMenuContext = createContext<CommandMenuContextProps>({
	hasFooter: false,
	flatItems: [],
	selectedKeys: new Set(),
	setSelectedKeys: () => {},
})

const CommandMenuContent = ({
	items,
	children,
	inputValue,
	defaultItems,
	onInputChange,
	onSelectionChange,
	sensitivity = "base",
	placeholder = "Search",
	defaultSelectedKeys,
	...otherProps
}: CommandMenuContentProps) => {
	const inputRef = useRef<HTMLInputElement>(null)
	const { contains } = useFilter({ sensitivity })

	const [selectedKeys, setSelectedKeys] = useState<Iterable<Key>>(defaultSelectedKeys ?? new Set())

	// Flatten the items and register hotkeys for items with shortcut keys.
	const resolvedItems = items ?? defaultItems ?? []
	const flatItems = resolvedItems.reduce<CommandDropdownMenuItemProps[]>(
		(acc, group) => [...acc, ...group.items],
		[],
	)
	const itemsWithShortcutKeys = flatItems.filter((item) => item.shortcutKeys?.length)
	const itemsWithShortcutKeysFormatted = itemsWithShortcutKeys.map((item) => ({
		...item,
		shortcutKeys: item.shortcutKeys!.map((key) => {
			if (key.startsWith("⌘")) return key.replace("⌘", key.length > 1 ? "meta+" : "meta")

			return key
		}),
	}))

	// Register hotkeys for items with shortcut keys.
	const useHotkeysRef = useHotkeys(
		itemsWithShortcutKeysFormatted.map((item) => item.shortcutKeys!.join("+")),
		(keyboardEvent, hotkeysEvent) => {
			keyboardEvent.preventDefault()

			const item = itemsWithShortcutKeysFormatted.find((option) => {
				const parsedHotkey = parseHotkey(option.shortcutKeys?.join("+")!)

				return isDeepEqual(parsedHotkey, hotkeysEvent)
			})

			if (item) onSelectionChange?.(new Set([item.id]))
		},
		{ enableOnFormTags: true },
	)

	// Register hotkey for input
	useHotkeys("meta+/", () => inputRef.current?.focus())

	// Determine if the command menu has a footer.
	const hasFooter = useMemo(() => {
		let hasFooter = false

		Children.forEach(children, (child) => {
			if (child && typeof child === "object" && "type" in child && child.type === CommandMenuFooter) {
				hasFooter = true
			}
		})

		return hasFooter
	}, [children])

	return (
		<CommandMenuContext.Provider
			value={{
				hasFooter,
				flatItems,
				selectedKeys,
				setSelectedKeys,
				onSelectionChange,
				items,
				...otherProps,
			}}
		>
			<CommandDialog
				isOpen={otherProps.isOpen}
				onOpenChange={otherProps.onOpenChange}
				className={otherProps.className as string}
			>
				<AriaAutocomplete
					{...{ inputValue, onInputChange }}
					filter={contains}
					aria-label="Command Menu"
				>
					<AriaTextField>
						<CommandInput
							autoFocus
							shortcutKeys={["⌘/"]}
							placeholder={placeholder}
							ref={mergeRefs([inputRef, useHotkeysRef])}
							className="relative outline-hidden! after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-border-secondary"
						/>
					</AriaTextField>
					{children}
				</AriaAutocomplete>
			</CommandDialog>
		</CommandMenuContext.Provider>
	)
}

interface CommandMenuProps extends ModalOverlayProps {
	className?: string
}

export const CommandDialog = ({ className, children, ...comboboxProps }: CommandMenuProps) => {
	return (
		<AriaModalOverlay
			{...comboboxProps}
			isDismissable
			className={({ isEntering, isExiting }) =>
				cx(
					"fixed inset-0 z-50 flex min-h-full items-start justify-center overflow-y-auto bg-overlay/70 p-4 text-center backdrop-blur md:pt-16 xl:pt-[clamp(64px,24vh,243px)]",
					isEntering && "duration-300 ease-out animate-in fade-in",
					isExiting && "duration-200 ease-in animate-out fade-out",
				)
			}
		>
			<AriaModal
				className={({ isEntering, isExiting }) =>
					cx(
						"flex max-h-full w-160 flex-col overflow-hidden rounded-xl bg-primary text-left align-middle shadow-xl",
						isEntering && "duration-300 ease-out animate-in zoom-in-95",
						isExiting && "duration-200 ease-in animate-out zoom-out-95",
						className,
					)
				}
			>
				<AriaDialog className="relative flex min-h-0 flex-1 flex-col outline-hidden">
					{children as ReactNode}
				</AriaDialog>
			</AriaModal>
		</AriaModalOverlay>
	)
}

interface CommandMenuListProps extends Omit<ListBoxProps<CommandMenuGroupType>, "items"> {}

export const CommandMenuList = ({ className, selectionMode = "single", ...props }: CommandMenuListProps) => {
	const { flatItems, hasFooter, emptyState, ...listBoxProps } = useContext(CommandMenuContext)

	return (
		<AriaListBox
			{...props}
			{...listBoxProps}
			renderEmptyState={() => emptyState}
			selectionMode={selectionMode}
			onSelectionChange={(key) => {
				listBoxProps.onSelectionChange?.(key as Set<Key>)
				listBoxProps.setSelectedKeys(key as Set<Key>)
			}}
			className={(state) =>
				cx(
					"flex max-h-106 flex-1 flex-col gap-2 overflow-auto focus:outline-hidden",
					hasFooter && "pb-13",
					!state.isEmpty && "pt-2",
					typeof className === "function" ? className(state) : className,
				)
			}
		/>
	)
}

interface CommandMenuSectionProps extends ListBoxSectionProps<CommandDropdownMenuItemProps> {
	title?: string
}

export const CommandMenuSection = ({ title, children, items, ...props }: CommandMenuSectionProps) => {
	return (
		<AriaListBoxSection
			{...props}
			className={cx("border-b border-secondary pb-2 last:border-transparent", props.className)}
		>
			{title && (
				<CommandMenuHeader key={title} size="sm" className="mb-0.5">
					{title}
				</CommandMenuHeader>
			)}
			<AriaCollection items={items}>{children}</AriaCollection>
		</AriaListBoxSection>
	)
}

interface PreviewChildrenProps {
	/**
	 * The unique identifier (`Key`) of the selected item.
	 */
	selectedId: Key
}

interface CommandMenuPreviewProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
	asChild?: boolean
	children: ({ selectedId }: PreviewChildrenProps) => ReactNode | ReactNode
}

export const CommandMenuPreview = ({ children, asChild, ...props }: CommandMenuPreviewProps) => {
	const { selectedKeys } = useContext(CommandMenuContext)

	const keys = Array.from(selectedKeys)
	if (!keys.length) return null

	const selectedId = keys.at(0) as Key

	if (asChild) {
		return <Fragment>{typeof children === "function" ? children({ selectedId }) : children}</Fragment>
	}

	return <div {...props}>{typeof children === "function" ? children({ selectedId }) : children}</div>
}

export const CommandMenuGroup = ({ className, ...props }: ComponentPropsWithRef<"div">) => {
	return <div {...props} className={cx("min-h-0 flex-1", className)} />
}

const CommandMenu = CommandMenuContent as typeof CommandMenuContent & {
	Item: typeof CommandDropdownMenuItem
	List: typeof CommandMenuList
	Group: typeof CommandMenuGroup
	Footer: typeof CommandMenuFooter
	Preview: typeof CommandMenuPreview
	Section: typeof CommandMenuSection
	Trigger: typeof AriaDialogTrigger
	Collection: typeof AriaCollection
}

CommandMenu.Item = CommandDropdownMenuItem
CommandMenu.List = CommandMenuList
CommandMenu.Group = CommandMenuGroup
CommandMenu.Footer = CommandMenuFooter
CommandMenu.Preview = CommandMenuPreview
CommandMenu.Section = CommandMenuSection
CommandMenu.Trigger = AriaDialogTrigger
CommandMenu.Collection = AriaCollection

export { CommandMenu }
