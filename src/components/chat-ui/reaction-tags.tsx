import { createMemo, For } from "solid-js"
import type { Message } from "~/lib/hooks/data/use-chat-messages"
import { newId } from "~/lib/id-helpers"
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

    const currentSelectedEmojis = createMemo(() => {
        return props.message.reactions.filter((reaction) => reaction.userId === userId)
    })


    return <div class="flex gap-2">
        <For each={reactionGroups()}>
            {(group) => {
                return <div class="flex items-center gap-1 bg-primary/50 rounded-full px-2 cursor-pointer" onClick={() => {
                    
                    const currentSelectedEmoji = currentSelectedEmojis().find((reaction) => reaction.emoji === group.emoji)

                    if(currentSelectedEmoji) {
                        z.mutate.reactions.delete({
                            id: currentSelectedEmoji.id
                        })
                    } else {
                        z.mutate.reactions.insert({
                            messageId: props.message.id,
                            userId,
                            emoji: group.emoji,
                            id: newId('reactions')
                        })
                    }
                }}>
                    {group.emoji} <span class="ml-1 text-xs">{group.reactions.length}</span>
                </div>
            }}
        </For>
    </div>
}
