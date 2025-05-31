import { useAuth } from "clerk-solidjs"
import type { Doc } from "convex-hazel/_generated/dataModel"
import { type Accessor, For, createMemo } from "solid-js"

type MessageReaction = {
	emoji: string
	userId: string
}

type ReactionTagsProps = {
	message: Accessor<Doc<"messages">>
}

export function ReactionTags(props: ReactionTagsProps) {
	const { userId } = useAuth()

	const reactionGroups = createMemo(() => {
		const groups: Record<string, { emoji: string; reactions: MessageReaction[] }> = {}
		for (const reaction of props.message().reactions) {
			if (!groups[reaction.emoji]) {
				groups[reaction.emoji] = { emoji: reaction.emoji, reactions: [] }
			}
			groups[reaction.emoji].reactions.push(reaction)
		}
		return Object.values(groups)
	})

	const currentSelectedEmojis = createMemo(() => {
		return props.message().reactions.filter((reaction) => reaction.userId === userId())
	})

	return (
		<div class="flex gap-2">
			<For each={reactionGroups()}>
				{(group) => {
					return (
						<button
							type="button"
							class="flex cursor-pointer items-center gap-1 rounded-full bg-primary/50 px-2 hover:bg-primary/70"
							onClick={() => {
								const currentSelectedEmoji = currentSelectedEmojis().find(
									(reaction) => reaction.emoji === group.emoji,
								)

								// TODO: Reimplement removing reactions

								// if (currentSelectedEmoji) {
								// 	z.mutate.reactions.delete({
								// 		id: currentSelectedEmoji.id,
								// 	})
								// } else {
								// 	z.mutate.reactions.insert({
								// 		messageId: props.message().id,
								// 		userId: userId()!,
								// 		emoji: group.emoji,
								// 		id: newId("reactions"),
								// 	})
								// }
							}}
						>
							{group.emoji} <span class="ml-1 text-xs">{group.reactions.length}</span>
						</button>
					)
				}}
			</For>
		</div>
	)
}
