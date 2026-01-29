import type { ChannelId, OrganizationId } from "@hazel/schema"
import { createContext, useContext, useMemo, useRef } from "react"
import type { SlateMessageEditorRef } from "../slate-editor/slate-message-editor"

interface ComposerContextValue {
	channelId: ChannelId
	organizationId: OrganizationId
	placeholder: string
	editorRef: React.RefObject<SlateMessageEditorRef | null>
}

const ComposerContext = createContext<ComposerContextValue | null>(null)

export function useComposerContext() {
	const context = useContext(ComposerContext)
	if (!context) {
		throw new Error("Composer compound components must be used within Composer.Provider")
	}
	return context
}

interface ComposerProviderProps {
	channelId: ChannelId
	organizationId: OrganizationId
	placeholder?: string
	children: React.ReactNode
}

export function ComposerProvider({
	channelId,
	organizationId,
	placeholder = "Type a message...",
	children,
}: ComposerProviderProps) {
	const editorRef = useRef<SlateMessageEditorRef | null>(null)

	const contextValue = useMemo(
		(): ComposerContextValue => ({
			channelId,
			organizationId,
			placeholder,
			editorRef,
		}),
		[channelId, organizationId, placeholder],
	)

	return <ComposerContext value={contextValue}>{children}</ComposerContext>
}
