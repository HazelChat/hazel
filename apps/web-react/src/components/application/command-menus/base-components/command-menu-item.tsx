import type { FC } from "react"
import { Text as AriaText, ListBoxItem, type ListBoxItemProps } from "react-aria-components"
import { Avatar } from "@/components/base/avatar/avatar"
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icons"
import { cx } from "@/utils/cx"
import { CommandShortcut } from "./command-shortcut"

interface CommandMenuItemBaseType {
	id: string
	label: string
	description?: string
	stacked?: boolean
	size?: "sm" | "md"
	shortcutKeys?: string[]
}

interface CommandDropdownMenuItemDefaultType extends CommandMenuItemBaseType {
	type?: "default"
}

interface CommandDropdownMenuItemIconType extends CommandMenuItemBaseType {
	type: "icon"
	icon: FC<{ className?: string }>
}

interface CommandDropdownMenuItemAvatarType extends CommandMenuItemBaseType {
	type: "avatar"
	src: string
	alt: string
}

interface CommandDropdownMenuItemDotType extends CommandMenuItemBaseType {
	type: "dot"
	dotColor: "green"
}

export type CommandDropdownMenuItemType =
	| CommandDropdownMenuItemDefaultType
	| CommandDropdownMenuItemIconType
	| CommandDropdownMenuItemAvatarType
	| CommandDropdownMenuItemDotType

const styles = {
	sm: { wrapper: "py-2 px-2.5", label: "text-sm font-medium", description: "text-sm" },
	md: { wrapper: "p-2.5", label: "text-md font-medium", description: "text-md font-medium" },
}

export type CommandDropdownMenuItemProps = CommandDropdownMenuItemType & ListBoxItemProps

export const CommandDropdownMenuItem = ({
	label,
	description,
	stacked,
	size = "md",
	shortcutKeys,
	className,
	...props
}: CommandDropdownMenuItemProps) => {
	return (
		<ListBoxItem
			{...props}
			textValue={label}
			className={(state) =>
				cx(
					"group cursor-pointer px-2 py-0.5 outline-hidden",
					typeof className === "function" ? className(state) : className,
				)
			}
		>
			{({ isFocusVisible, isSelected }) => (
				<div
					className={cx(
						"relative flex items-center justify-between rounded-lg pl-2.5 outline-focus-ring transition duration-100 ease-linear hover:bg-primary_hover",
						styles[size].wrapper,
						isSelected && "bg-primary_hover",
						isFocusVisible && "outline-2 outline-offset-2",
						stacked && "items-start p-2.5 pl-3.5",
					)}
				>
					{props.type === "icon" && !stacked && (
						<props.icon className="mr-2 size-5 text-fg-quaternary" />
					)}
					{props.type === "icon" && stacked && (
						<FeaturedIcon
							color="gray"
							size="md"
							theme="modern"
							icon={props.icon}
							className="mr-2"
						/>
					)}

					{props.type === "avatar" && (
						<Avatar
							alt={props.alt}
							src={props.src}
							size={stacked ? (size === "md" ? "lg" : "md") : "xs"}
							className="mr-2"
						/>
					)}

					{props.type === "dot" && (
						<svg
							width="10"
							height="10"
							viewBox="0 0 10 10"
							fill="none"
							className={cx(
								"mr-2 shrink-0 text-fg-success-secondary",
								stacked && "mt-2 self-start",
							)}
						>
							<circle cx="5" cy="5" r="4" fill="currentColor" />
						</svg>
					)}

					<div className={cx("flex flex-1 gap-x-2", stacked && "flex-col")}>
						<AriaText slot="label" className={cx("text-primary", styles[size].label)}>
							{label}
						</AriaText>
						{description && (
							<AriaText
								slot="description"
								className={cx("text-sm text-tertiary", styles[size].description)}
							>
								{description}
							</AriaText>
						)}
					</div>

					{shortcutKeys && <CommandShortcut keys={shortcutKeys} />}
				</div>
			)}
		</ListBoxItem>
	)
}
