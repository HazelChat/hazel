"use client"

import { use } from "react"
import type { InputProps } from "react-aria-components"
import {
	Button,
	Input as InputPrimitive,
	OverlayTriggerStateContext,
	Radio,
	RadioGroup,
} from "react-aria-components"
import { twMerge } from "tailwind-merge"
import { cx } from "~/lib/primitive"

function ChevronLeftIcon({ className }: { className?: string }) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className={className}>
			<path
				fillRule="evenodd"
				d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}

/**
 * Container for form content in command palette
 */
export function CommandMenuFormContainer({
	children,
	className,
}: {
	children: React.ReactNode
	className?: string
}) {
	return <div className={twMerge("flex h-full flex-col overflow-hidden", className)}>{children}</div>
}

/**
 * Header for form pages in command palette
 * Replaces the search input for form pages
 */
export function CommandMenuFormHeader({
	title,
	subtitle,
	onBack,
	className,
}: {
	title: string
	subtitle?: string
	onBack?: () => void
	className?: string
}) {
	const state = use(OverlayTriggerStateContext)!

	return (
		<div className={twMerge("flex items-center gap-2 border-b px-3 py-2.5 sm:px-2.5 sm:py-2", className)}>
			{onBack && (
				<Button
					onPress={onBack}
					className="flex size-6 cursor-default items-center justify-center rounded text-muted-fg transition-colors hover:bg-muted hover:text-fg"
				>
					<ChevronLeftIcon className="size-4" />
				</Button>
			)}
			<div className="min-w-0 flex-1">
				<h2 className="truncate font-semibold text-fg text-sm">{title}</h2>
				{subtitle && <p className="truncate text-muted-fg text-xs">{subtitle}</p>}
			</div>
			<Button
				onPress={() => state?.close()}
				className="hidden cursor-default rounded border px-1.5 py-0.5 text-muted-fg text-xs hover:bg-muted lg:inline"
			>
				Esc
			</Button>
		</div>
	)
}

/**
 * Body section for form content
 */
export function CommandMenuFormBody({
	children,
	className,
}: {
	children: React.ReactNode
	className?: string
}) {
	return <div className={twMerge("flex-1 overflow-y-auto p-3 sm:p-2.5", className)}>{children}</div>
}

/**
 * Footer with keyboard hints and submit button
 */
export function CommandMenuFormFooter({
	children,
	className,
}: {
	children: React.ReactNode
	className?: string
}) {
	return (
		<div
			className={twMerge(
				"flex items-center justify-between gap-2 border-t px-3 py-2 sm:px-2.5 sm:py-1.5",
				"text-muted-fg text-xs",
				"*:[kbd]:inset-ring *:[kbd]:inset-ring-fg/10 *:[kbd]:mx-0.5 *:[kbd]:inline-grid *:[kbd]:h-4 *:[kbd]:min-w-4 *:[kbd]:place-content-center *:[kbd]:rounded-xs *:[kbd]:bg-secondary *:[kbd]:px-1",
				className,
			)}
		>
			{children}
		</div>
	)
}

/**
 * Form field wrapper with label
 */
export function CommandMenuFormField({
	label,
	error,
	children,
	className,
}: {
	label?: string
	error?: string
	children: React.ReactNode
	className?: string
}) {
	return (
		<div className={twMerge("space-y-1.5", className)}>
			{label && <label className="block font-medium text-fg text-xs">{label}</label>}
			{children}
			{error && (
				<p className="text-danger-subtle-fg text-xs" role="alert">
					{error}
				</p>
			)}
		</div>
	)
}

interface CommandMenuInputProps extends Omit<InputProps, "className"> {
	className?: string
	icon?: React.ReactNode
}

/**
 * Simplified input for command palette forms
 */
export function CommandMenuInput({ className, icon, ...props }: CommandMenuInputProps) {
	return (
		<div className="relative">
			{icon && (
				<div className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-fg">
					{icon}
				</div>
			)}
			<InputPrimitive
				className={cx(
					"w-full rounded-md border border-input bg-transparent px-2.5 py-1.5 text-fg text-sm placeholder:text-muted-fg",
					"outline-none focus:border-ring focus:ring-2 focus:ring-ring/20",
					icon && "pl-8",
					className,
				)}
				{...props}
			/>
		</div>
	)
}

/**
 * Inline toggle group for binary choices (e.g., public/private)
 */
export function CommandMenuToggle({
	value,
	onChange,
	options,
	className,
}: {
	value: string
	onChange: (value: string) => void
	options: { value: string; label: string; icon?: React.ReactNode }[]
	className?: string
}) {
	return (
		<RadioGroup
			value={value}
			onChange={onChange}
			orientation="horizontal"
			className={twMerge("flex gap-2", className)}
		>
			{options.map((option) => (
				<Radio
					key={option.value}
					value={option.value}
					className={({ isSelected }) => {
						const baseClasses =
							"flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors"
						const stateClasses = isSelected
							? "border-primary bg-primary/10 text-primary"
							: "border-border bg-transparent text-muted-fg hover:bg-muted hover:text-fg"
						return `${baseClasses} ${stateClasses}`
					}}
				>
					{option.icon}
					{option.label}
				</Radio>
			))}
		</RadioGroup>
	)
}
