import type { ChannelId, OrganizationId } from "@hazel/schema"
import { createContext, use, useCallback, useMemo, useRef } from "react"
import type { SlateMessageEditorRef } from "../slate-editor/slate-message-editor"

// ============================================================================
// State / Actions / Meta Interfaces
// ============================================================================

export interface ComposerState {
	channelId: ChannelId
	organizationId: OrganizationId
	placeholder: string
}

export interface ComposerActions {
	focus: () => void
	clear: () => void
}

export interface ComposerMeta {
	editorRef: React.RefObject<SlateMessageEditorRef | null>
}

interface ComposerContextValue {
	state: ComposerState
	actions: ComposerActions
	meta: ComposerMeta
}

// ============================================================================
// Context
// ============================================================================

const ComposerContext = createContext<ComposerContextValue | null>(null)

export function useComposerContext(): ComposerContextValue {
	const context = use(ComposerContext)
	if (!context) {
		throw new Error("Composer compound components must be used within Composer.Provider")
	}
	return context
}

export function useComposerState(): ComposerState {
	return useComposerContext().state
}

export function useComposerActions(): ComposerActions {
	return useComposerContext().actions
}

export function useComposerMeta(): ComposerMeta {
	return useComposerContext().meta
}

// ============================================================================
// Provider
// ============================================================================

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

	const state = useMemo(
		(): ComposerState => ({
			channelId,
			organizationId,
			placeholder,
		}),
		[channelId, organizationId, placeholder],
	)

	const focus = useCallback(() => {
		editorRef.current?.focus()
	}, [])

	const clear = useCallback(() => {
		editorRef.current?.clearContent()
	}, [])

	const actions = useMemo(
		(): ComposerActions => ({
			focus,
			clear,
		}),
		[focus, clear],
	)

	const meta = useMemo(
		(): ComposerMeta => ({
			editorRef,
		}),
		[],
	)

	const contextValue = useMemo(
		(): ComposerContextValue => ({
			state,
			actions,
			meta,
		}),
		[state, actions, meta],
	)

	return <ComposerContext value={contextValue}>{children}</ComposerContext>
}
