import { createMemo, For } from "solid-js"
import type { Message } from "~/lib/hooks/data/use-chat-messages"
import { useZero } from "~/lib/zero-context"

type MessageReaction = {
	id: string
	emoji: string
	userId: string
}


type ReactionTagsProps = {
    message: Message
}

export function ReactionTags(props: ReactionTagsProps) {
    const z = useZero()
    const userId = z.userID

    const reactionGroups = createMemo(() => {
        const groups: Record<string, { emoji: string; reactions: MessageReaction[] }> = {}
		for (const reaction of props.message.reactions) {
			if (!groups[reaction.emoji]) {
				groups[reaction.emoji] = { emoji: reaction.emoji, reactions: [] }
			}
			groups[reaction.emoji].reactions.push(reaction)
		}
		return Object.values(groups)
    })

    const currentSelectedEmoji = createMemo(() => {
        return reactionGroups().find((group) => group.reactions.some((reaction) => reaction.userId === userId))
    })


    return <div class="flex gap-2">
        <For each={reactionGroups()}>
            {(group) => {
                return <p>
                    {group.emoji}
                </p>
            }}
        </For>
    </div>
}