"use client"

import type { ReactNode } from "react"
import type { BadgeIntent, MessageEmbedFieldType } from "@hazel/integrations/common"
import { cn } from "~/lib/utils"
import { Badge } from "~/components/ui/badge"
import { embedSectionStyles } from "./embed"
import { EmbedMarkdown } from "./embed-markdown"

export interface EmbedFieldOptions {
	intent?: BadgeIntent
}

export interface EmbedField {
	/** Field label/name */
	name: string
	/** Field value - can be a string or React node (e.g., avatar, badge) */
	value: ReactNode
	/** If true, displays inline with other inline fields (like Discord) */
	inline?: boolean
	/** Field type - determines how the value is rendered */
	type?: MessageEmbedFieldType
	/** Type-specific options */
	options?: EmbedFieldOptions
}

export interface EmbedFieldsProps {
	/** Array of fields to display */
	fields: EmbedField[]
	/** Additional class names */
	className?: string
}

/**
 * Flexible metadata grid for the embed - like Discord's embed fields.
 * Inline fields display side-by-side, non-inline fields take full width.
 */
export function EmbedFields({ fields, className }: EmbedFieldsProps) {
	if (fields.length === 0) return null

	return (
		<div
			className={cn(
				embedSectionStyles({ position: "bottom" }),
				"flex flex-wrap items-center gap-x-3 gap-y-1.5 bg-muted/10",
				className,
			)}
		>
			{fields.map((field, index) => (
				<div
					key={`${field.name}-${index}`}
					className={cn("flex items-center gap-1.5", !field.inline && "w-full")}
				>
					{field.type === "badge" && typeof field.value === "string" ? (
						<Badge intent={field.options?.intent ?? "secondary"} size="sm" isPill>
							{field.value}
						</Badge>
					) : typeof field.value === "string" ? (
						<span className="text-muted-fg text-xs">
							<EmbedMarkdown>{field.value}</EmbedMarkdown>
						</span>
					) : (
						field.value
					)}
				</div>
			))}
		</div>
	)
}
