import { useAuth } from "clerk-solidjs"
import { createEffect, createMemo, createSignal, onCleanup } from "solid-js"
import { useChat } from "./chat-store"

interface PresenceUser {
	user_id: string
	channel_id: string
	online_at: string
	typing: boolean
}

// TODO: Reimplement

export const createPresence = () => {
	const { userId } = useAuth()

	let typingTimeout: NodeJS.Timeout | undefined

	const [isTyping, setIsTyping] = createSignal(false)
	const [isSubscribed, setIsSubscribed] = createSignal(false)

	const { state, setState } = useChat()

	const channel = createMemo(() => {
		if (!userId()) throw new Error("UserId is not defined")

		// return supabase.channel(`channel-${state.channelId}`, {
		// 	config: {
		// 		presence: {
		// 			key: userId()!,
		// 		},
		// 	},
		// })
	})

	const trackPresence = async (data: Partial<PresenceUser>) => {
		if (!isSubscribed()) return

		// await channel().track({
		// 	user_id: userId(),
		// 	online_at: new Date().toISOString(),
		// 	typing: false,
		// 	...data,
		// })
	}

	const trackTyping = async (typing: boolean) => {
		if (typingTimeout) {
			clearTimeout(typingTimeout)
		}

		if (typing) {
			typingTimeout = setTimeout(() => {
				setIsTyping(false)
				trackPresence({ typing: false })
				typingTimeout = undefined
			}, 1500)
		}

		if (isTyping() === typing) return

		setIsTyping(typing)
		await trackPresence({ typing })
	}

	createEffect(() => {
		// channel().subscribe(async (status) => {
		// 	if (status === "SUBSCRIBED") {
		// 		setIsSubscribed(true)
		// 		await trackPresence({})
		// 	}
		// })

		const updateState = () => {
			// const state = channel().presenceState<PresenceUser>()
			// const presenceUsers = Object.keys(state)
			// 	.map((key) => state[key][0])
			// 	.filter((user) => user.user_id !== userId())
			// setState(
			// 	"typingUserIds",
			// 	presenceUsers.filter((user) => user.typing).map((user) => user.user_id),
			// )
			// setState(
			// 	"onlineUserIds",
			// 	presenceUsers.map((user) => user.user_id),
			// )
		}

		// channel().on("presence", { event: "sync" }, updateState)
		// channel().on("presence", { event: "join" }, updateState)
		// channel().on("presence", { event: "leave" }, updateState)
	})

	onCleanup(() => {
		clearTimeout(typingTimeout)
		// channel().untrack()
		// supabase.removeChannel(channel())
	})

	return {
		trackPresence,
		trackTyping,
	} as const
}
