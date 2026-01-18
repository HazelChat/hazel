import type { Bot, BotCommand } from "@hazel/domain/models"
import type { PublicBotInfo } from "@hazel/domain/rpc"
import type { Schema } from "effect"
import { HazelRpcClient } from "~/lib/services/common/rpc-atom-client"

/**
 * Type for bot data returned from RPC.
 * Inferred from the domain model's JSON schema to stay in sync automatically.
 */
export type BotData = Schema.Schema.Type<typeof Bot.Model.json>

/**
 * Type for bot command data returned from RPC.
 */
export type BotCommandData = Schema.Schema.Type<typeof BotCommand.Model.json>

/**
 * Type for public bot data with install status.
 */
export type PublicBotData = PublicBotInfo

// === Bot Management (for bot creators) ===

/**
 * Mutation atom for creating a new bot.
 * Returns the bot data including the plain token (only shown once).
 */
export const createBotMutation = HazelRpcClient.mutation("bot.create")

/**
 * Mutation atom for listing bots created by the user.
 */
export const listBotsMutation = HazelRpcClient.mutation("bot.list")

/**
 * Mutation atom for getting a single bot by ID.
 */
export const getBotMutation = HazelRpcClient.mutation("bot.get")

/**
 * Mutation atom for updating bot configuration.
 */
export const updateBotMutation = HazelRpcClient.mutation("bot.update")

/**
 * Mutation atom for deleting a bot.
 */
export const deleteBotMutation = HazelRpcClient.mutation("bot.delete")

/**
 * Mutation atom for regenerating a bot's API token.
 * Returns the new token (only shown once).
 */
export const regenerateBotTokenMutation = HazelRpcClient.mutation("bot.regenerateToken")

/**
 * Mutation atom for listing commands registered by a bot.
 */
export const getBotCommandsMutation = HazelRpcClient.mutation("bot.getCommands")

// === Bot Marketplace (for bot users) ===

/**
 * Mutation atom for listing public bots in the marketplace.
 * Returns bots with isInstalled flag and creator name.
 */
export const listPublicBotsMutation = HazelRpcClient.mutation("bot.listPublic")

/**
 * Mutation atom for listing bots installed in the organization.
 */
export const listInstalledBotsMutation = HazelRpcClient.mutation("bot.listInstalled")

/**
 * Mutation atom for installing a public bot.
 */
export const installBotMutation = HazelRpcClient.mutation("bot.install")

/**
 * Mutation atom for uninstalling a bot.
 */
export const uninstallBotMutation = HazelRpcClient.mutation("bot.uninstall")

/**
 * Mutation atom for updating a bot's avatar.
 */
export const updateBotAvatarMutation = HazelRpcClient.mutation("bot.updateAvatar")
