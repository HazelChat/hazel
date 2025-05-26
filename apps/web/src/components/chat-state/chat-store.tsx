import type { ChannelId, MessageId } from "@maki-chat/api-schema/schema/message.js"
import { type JSX, createContext, createEffect, splitProps, useContext } from "solid-js"
import { createStore } from "solid-js/store"

interface ChatStore extends InputChatStore {
	replyToMessageId: MessageId | null
	openThreadId: ChannelId | null
	imageDialog: {
		open: boolean
		messageId: MessageId | null
		selectedImage: string | null
	}
	onlineUserIds: string[]
	typingUserIds: string[]
}

interface InputChatStore {
	channelId: ChannelId
}

const createChatStore = (props: InputChatStore) => {
	const [state, setState] = createStore<ChatStore>({
		replyToMessageId: null,
		openThreadId: null,
		imageDialog: {
			open: false,
			messageId: null,
			selectedImage: null,
		},
		onlineUserIds: [],
		typingUserIds: [],
		...props,
	})

	return {
		state,
		setState,
	}
}

export const ChatContext = createContext<ReturnType<typeof createChatStore> | undefined>()

export const ChatProvider = (props: { children: JSX.Element } & InputChatStore) => {
	const [childProps, restProps] = splitProps(props, ["children"])
	const chatStore$ = createChatStore(restProps)

	return <ChatContext.Provider value={chatStore$}>{childProps.children}</ChatContext.Provider>
}

export const useChat = () => {
	const context = useContext(ChatContext)

	if (!context) {
		throw new Error("useChat must be used within a ChatProvider")
	}

	return context
}
