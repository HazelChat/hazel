import type { ChannelId, ChannelMemberId, TypingIndicatorId } from "@hazel/db/schema"

interface TypingIndicatorConfig {
	channelId: ChannelId
	memberId: ChannelMemberId
	debounceDelay?: number
	typingTimeout?: number
	onUpsert: (params: { channelId: ChannelId; memberId: ChannelMemberId }) => Promise<void>
	onDelete: (params: {
		id?: TypingIndicatorId
		channelId: ChannelId
		memberId: ChannelMemberId
	}) => Promise<void>
}

interface TypingIndicatorState {
	id: TypingIndicatorId | null
	isTyping: boolean
	lastTyped: number
}

export class TypingIndicatorService {
	private state: TypingIndicatorState
	private config: Required<TypingIndicatorConfig>
	private debounceTimer: NodeJS.Timeout | null = null
	private typingTimer: NodeJS.Timeout | null = null

	constructor(config: TypingIndicatorConfig) {
		this.config = {
			...config,
			debounceDelay: config.debounceDelay ?? 500,
			typingTimeout: config.typingTimeout ?? 3000,
		}

		this.state = {
			id: null,
			isTyping: false,
			lastTyped: 0,
		}
	}

	async startTyping(): Promise<void> {
		// Clear any existing debounce timer
		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer)
		}

		// Clear any existing typing timeout
		if (this.typingTimer) {
			clearTimeout(this.typingTimer)
		}

		// Debounce the actual typing indicator update
		this.debounceTimer = setTimeout(async () => {
			await this.updateTypingIndicator()
		}, this.config.debounceDelay)

		// Set timeout to automatically stop typing
		this.typingTimer = setTimeout(() => {
			this.stopTyping()
		}, this.config.typingTimeout)

		this.state.isTyping = true
	}

	async stopTyping(): Promise<void> {
		// Clear all timers
		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer)
			this.debounceTimer = null
		}

		if (this.typingTimer) {
			clearTimeout(this.typingTimer)
			this.typingTimer = null
		}

		this.state.isTyping = false

		// Delete the typing indicator if it exists
		if (this.state.id) {
			await this.deleteTypingIndicator()
		}
	}

	private async updateTypingIndicator(): Promise<void> {
		const now = Date.now()
		this.state.lastTyped = now

		try {
			// Use the upsert callback - backend will handle create or update
			await this.config.onUpsert({
				channelId: this.config.channelId,
				memberId: this.config.memberId,
			})
			// Note: We don't track the ID anymore since backend handles upsert
		} catch (error) {
			console.warn("Failed to update typing indicator:", error)
		}
	}

	private async deleteTypingIndicator(): Promise<void> {
		try {
			await this.config.onDelete({
				id: this.state.id || undefined,
				channelId: this.config.channelId,
				memberId: this.config.memberId,
			})
			this.state.id = null
		} catch (error) {
			console.warn("Failed to delete typing indicator:", error)
			// Even if deletion fails, clear the local state
			this.state.id = null
		}
	}

	cleanup(): void {
		this.stopTyping()
	}

	getState(): TypingIndicatorState {
		return { ...this.state }
	}

	isTyping(): boolean {
		return this.state.isTyping
	}
}
