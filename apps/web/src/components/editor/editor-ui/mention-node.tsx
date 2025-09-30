"use client"

import { getMentionOnSelectItem } from "@platejs/mention"
import { eq, useLiveQuery } from "@tanstack/react-db"

import { useParams } from "@tanstack/react-router"
import type { TComboboxInputElement, TMentionElement } from "platejs"
import { IS_APPLE, KEYS } from "platejs"
import type { PlateElementProps } from "platejs/react"
import { PlateElement, useFocused, useReadOnly, useSelected } from "platejs/react"
import * as React from "react"
import { channelMemberCollection, userCollection } from "~/db/collections"
import { useMounted } from "~/hooks/use-mounted"
import { cn } from "~/lib/utils"
import {
	InlineCombobox,
	InlineComboboxContent,
	InlineComboboxEmpty,
	InlineComboboxGroup,
	InlineComboboxInput,
	InlineComboboxItem,
} from "./inline-combobox"

export function MentionElement(
	props: PlateElementProps<TMentionElement> & {
		prefix?: string
	},
) {
	const element = props.element

	const selected = useSelected()
	const focused = useFocused()
	const mounted = useMounted()
	const readOnly = useReadOnly()

	return (
		<PlateElement
			{...props}
			className={cn(
				"inline-block rounded-md bg-brand-primary/30 px-1.5 py-0.5 align-baseline font-medium",
				!readOnly && "cursor-pointer",
				selected && focused && "ring-2 ring-brand",
				element.children[0]![KEYS.bold] === true && "font-bold",
				element.children[0]![KEYS.italic] === true && "italic",
				element.children[0]![KEYS.underline] === true && "underline",
			)}
			attributes={{
				...props.attributes,
				contentEditable: false,
				"data-slate-value": element.value,
				draggable: true,
			}}
		>
			{mounted && IS_APPLE ? (
				// Mac OS IME https://github.com/ianstormtaylor/slate/issues/3490
				<React.Fragment>
					{props.children}
					{props.prefix || "@"}
					{element.value}
				</React.Fragment>
			) : (
				// Others like Android https://github.com/ianstormtaylor/slate/pull/5360
				<React.Fragment>
					{props.prefix || "@"}
					{element.value}
					{props.children}
				</React.Fragment>
			)}
		</PlateElement>
	)
}

const onSelectItem = getMentionOnSelectItem()

export function MentionInputElement(props: PlateElementProps<TComboboxInputElement>) {
	const { id } = useParams({ from: "/_app/$orgSlug/chat/$id" })
	const { editor, element } = props
	const [search, setSearch] = React.useState("")

	const { data: channelMembers } = useLiveQuery((q) =>
		q
			.from({ channelMember: channelMemberCollection })
			.innerJoin({ user: userCollection }, ({ channelMember, user }) =>
				eq(channelMember.userId, user.id),
			)
			.where(({ channelMember }) => eq(channelMember.channelId, id))
			.limit(100)
			.orderBy(({ channelMember }) => channelMember.joinedAt, "desc")
			.select(({ channelMember, user }) => ({
				...channelMember,
				user,
			})),
	)

	return (
		<PlateElement {...props} as="span">
			<InlineCombobox
				value={search}
				element={element}
				setValue={setSearch}
				showTrigger={false}
				trigger="@"
			>
				<span>
					@
					<InlineComboboxInput />
				</span>

				<InlineComboboxContent className="my-1.5">
					<InlineComboboxEmpty>No results</InlineComboboxEmpty>

					<InlineComboboxGroup>
						{channelMembers.map((item) => (
							<InlineComboboxItem
								key={item.id}
								value={item.userId}
								onClick={() => {
									onSelectItem(
										editor,
										{
											key: item.userId,
											text: `${item.user.firstName} ${item.user.lastName}`,
										},
										search,
									)
								}}
							>
								{item.user.firstName} {item.user.lastName}
							</InlineComboboxItem>
						))}
					</InlineComboboxGroup>
				</InlineComboboxContent>
			</InlineCombobox>
			{props.children}
		</PlateElement>
	)
}
