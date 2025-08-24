"use client"

import { AIChatPlugin } from "@platejs/ai/react"
import { Code02, List, Type01 } from "@untitledui/icons"
import { KEYS, type TComboboxInputElement } from "platejs"
import type { PlateEditor, PlateElementProps } from "platejs/react"
import { PlateElement } from "platejs/react"
import type * as React from "react"
import { insertBlock, insertInlineElement } from "~/components/editor/transforms"
import {
	InlineCombobox,
	InlineComboboxContent,
	InlineComboboxEmpty,
	InlineComboboxGroup,
	InlineComboboxGroupLabel,
	InlineComboboxInput,
	InlineComboboxItem,
} from "./inline-combobox"

type Group = {
	group: string
	items: {
		icon: React.ReactNode
		value: string
		onSelect: (editor: PlateEditor, value: string) => void
		className?: string
		focusEditor?: boolean
		keywords?: string[]
		label?: string
	}[]
}

const groups: Group[] = [
	{
		group: "Basic blocks",
		items: [
			{
				icon: <Type01 />,
				keywords: ["paragraph"],
				label: "Text",
				value: KEYS.p,
			},
			{
				icon: <List />,
				keywords: ["unordered", "ul", "-"],
				label: "Bulleted list",
				value: KEYS.ul,
			},
			{
				icon: <List />,
				keywords: ["ordered", "ol", "1"],
				label: "Numbered list",
				value: KEYS.ol,
			},
			{
				icon: <List />,
				keywords: ["checklist", "task", "checkbox", "[]"],
				label: "To-do list",
				value: KEYS.listTodo,
			},
			{
				icon: <Code02 />,
				keywords: ["```"],
				label: "Code Block",
				value: KEYS.codeBlock,
			},
			{
				icon: <Code02 />,
				keywords: ["citation", "blockquote", "quote", ">"],
				label: "Blockquote",
				value: KEYS.blockquote,
			},
		].map((item) => ({
			...item,
			onSelect: (editor, value) => {
				insertBlock(editor, value)
			},
		})),
	},
	{
		group: "Inline",
		items: [
			{
				focusEditor: true,
				icon: <Code02 />,
				keywords: ["time"],
				label: "Date",
				value: KEYS.date,
			},
			{
				focusEditor: false,
				icon: <Code02 />,
				label: "Inline Equation",
				value: KEYS.inlineEquation,
			},
		].map((item) => ({
			...item,
			onSelect: (editor, value) => {
				insertInlineElement(editor, value)
			},
		})),
	},
]

export function SlashInputElement(props: PlateElementProps<TComboboxInputElement>) {
	const { editor, element } = props

	return (
		<PlateElement {...props} as="span">
			<InlineCombobox element={element} trigger="/">
				<InlineComboboxInput />

				<InlineComboboxContent>
					<InlineComboboxEmpty>No results</InlineComboboxEmpty>

					{groups.map(({ group, items }) => (
						<InlineComboboxGroup key={group}>
							<InlineComboboxGroupLabel>{group}</InlineComboboxGroupLabel>

							{items.map(({ focusEditor, icon, keywords, label, value, onSelect }) => (
								<InlineComboboxItem
									key={value}
									value={value}
									onClick={() => onSelect(editor, value)}
									label={label}
									focusEditor={focusEditor}
									group={group}
									keywords={keywords}
								>
									<div className="mr-2 text-muted-foreground">{icon}</div>
									{label ?? value}
								</InlineComboboxItem>
							))}
						</InlineComboboxGroup>
					))}
				</InlineComboboxContent>
			</InlineCombobox>

			{props.children}
		</PlateElement>
	)
}
