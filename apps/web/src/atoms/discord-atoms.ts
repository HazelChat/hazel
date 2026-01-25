import { HazelRpcClient } from "~/lib/services/common/rpc-atom-client"

/**
 * Query atom for listing Discord guilds the bot has access to.
 */
export const listDiscordGuildsMutation = HazelRpcClient.mutation("discord.listGuilds")

/**
 * Query atom for listing Discord channels in a guild.
 */
export const listDiscordChannelsMutation = HazelRpcClient.mutation("discord.listChannels")

/**
 * Mutation atom for creating a webhook in a Discord channel.
 */
export const createDiscordWebhookMutation = HazelRpcClient.mutation("discord.createWebhook")
