export interface ChatSyncLiveDiscordTestConfig {
	guildId?: string
	channelId?: string
	channelId2?: string
	botToken?: string
	isConfigured: boolean
	missing: ReadonlyArray<string>
}

const readNonEmpty = (name: string): string | undefined => {
	const value = process.env[name]
	if (!value) return undefined
	const trimmed = value.trim()
	return trimmed.length > 0 ? trimmed : undefined
}

export const loadChatSyncLiveDiscordTestConfig = (): ChatSyncLiveDiscordTestConfig => {
	const guildId = readNonEmpty("DISCORD_SYNC_TEST_GUILD_ID")
	const channelId = readNonEmpty("DISCORD_SYNC_TEST_CHANNEL_ID")
	const channelId2 = readNonEmpty("DISCORD_SYNC_TEST_CHANNEL_ID_2")
	const botToken =
		readNonEmpty("DISCORD_SYNC_TEST_BOT_TOKEN") ??
		readNonEmpty("DISCORD_BOT_TOKEN")

	const missing: string[] = []
	if (!guildId) {
		missing.push("DISCORD_SYNC_TEST_GUILD_ID")
	}
	if (!channelId) {
		missing.push("DISCORD_SYNC_TEST_CHANNEL_ID")
	}
	if (!botToken) {
		missing.push("DISCORD_SYNC_TEST_BOT_TOKEN|DISCORD_BOT_TOKEN")
	}

	return {
		guildId,
		channelId,
		channelId2,
		botToken,
		isConfigured: missing.length === 0,
		missing,
	}
}
