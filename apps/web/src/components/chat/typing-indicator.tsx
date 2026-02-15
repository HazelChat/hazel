import { useChatStable } from "~/hooks/use-chat"
import { useTypingIndicators } from "~/hooks/use-typing-indicators"

export function TypingIndicator() {
	const { channelId } = useChatStable()

	const { typingUsers } = useTypingIndicators({ channelId })

	if (typingUsers.length === 0) {
		return null
	}

	const typingText = () => {
		if (typingUsers.length === 1) {
			return `${typingUsers[0]!.user.firstName} is typing...`
		}
		if (typingUsers.length === 2) {
			return `${typingUsers[0]!.user.firstName} and ${typingUsers[1]!.user.firstName} are typing...`
		}
		return `${typingUsers[0]!.user.firstName} and ${typingUsers.length - 1} others are typing...`
	}

	return (
		<div className="absolute bottom-full left-0 pb-1 pl-1">
			<div className="flex h-3 items-center gap-2 text-muted-fg text-xs">
				<div className="flex gap-1">
					<span className="inline-block size-2 animate-bounce rounded-full bg-muted-fg [animation-delay:-0.3s]" />
					<span className="inline-block size-2 animate-bounce rounded-full bg-muted-fg [animation-delay:-0.15s]" />
					<span className="inline-block size-2 animate-bounce rounded-full bg-muted-fg" />
				</div>
				<span>{typingText()}</span>
			</div>
		</div>
	)
}
