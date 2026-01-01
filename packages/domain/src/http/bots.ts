/**
 * Bot SDK HTTP API Definitions
 *
 * API endpoints for the built-in bot SDK.
 * Separate from integration-commands which handles third-party integrations.
 */

import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform"
import { Schema } from "effect"
import * as CurrentUser from "../current-user.ts"
import { InternalServerError, UnauthorizedError } from "../errors.ts"
import { ChannelId, OrganizationId, UserId } from "../ids.ts"

// ============ REQUEST SCHEMAS ============

export const BotCommandArgumentValue = Schema.Struct({
	name: Schema.String,
	value: Schema.String,
})
export type BotCommandArgumentValue = typeof BotCommandArgumentValue.Type

export class ExecuteBotCommandRequest extends Schema.Class<ExecuteBotCommandRequest>("ExecuteBotCommandRequest")({
	channelId: ChannelId,
	arguments: Schema.Array(BotCommandArgumentValue),
}) {}

// Request for posting a bot message (internal endpoint for bot actors)
export class PostBotMessageRequest extends Schema.Class<PostBotMessageRequest>("PostBotMessageRequest")({
	orgId: OrganizationId,
	channelId: ChannelId,
	content: Schema.String,
}) {}

// ============ RESPONSE SCHEMAS ============

// Bot command execution response
export class ExecuteBotCommandResponse extends Schema.Class<ExecuteBotCommandResponse>("ExecuteBotCommandResponse")({
	success: Schema.Boolean,
	responseMessage: Schema.NullOr(Schema.String),
	error: Schema.NullOr(Schema.String),
	data: Schema.NullOr(Schema.Unknown),
}) {}

// Response for posting a bot message
export class PostBotMessageResponse extends Schema.Class<PostBotMessageResponse>("PostBotMessageResponse")({
	success: Schema.Boolean,
}) {}

// Command argument definition
export const BotCommandArgumentSchema = Schema.Struct({
	name: Schema.String,
	type: Schema.Literal("string", "number", "user", "channel"),
	required: Schema.Boolean,
	placeholder: Schema.NullOr(Schema.String),
	description: Schema.NullOr(Schema.String),
})
export type BotCommandArgumentSchema = typeof BotCommandArgumentSchema.Type

// Bot info for command
export const BotInfoSchema = Schema.Struct({
	id: Schema.String,
	name: Schema.String,
	avatarUrl: Schema.NullOr(Schema.String),
})
export type BotInfoSchema = typeof BotInfoSchema.Type

// Full command definition
export const BotCommandSchema = Schema.Struct({
	id: Schema.String,
	name: Schema.String,
	description: Schema.String,
	botId: Schema.String,
	arguments: Schema.Array(BotCommandArgumentSchema),
	usageExample: Schema.NullOr(Schema.String),
	bot: BotInfoSchema,
})
export type BotCommandSchema = typeof BotCommandSchema.Type

export class AvailableBotCommandsResponse extends Schema.Class<AvailableBotCommandsResponse>(
	"AvailableBotCommandsResponse",
)({
	commands: Schema.Array(BotCommandSchema),
}) {}

// Installed bot info
export const InstalledBotSchema = Schema.Struct({
	id: Schema.String,
	botId: Schema.String,
	name: Schema.String,
	displayName: Schema.String,
	description: Schema.String,
	avatar: Schema.NullOr(Schema.String),
	installedAt: Schema.DateFromString,
	installedBy: Schema.NullOr(UserId),
})
export type InstalledBotSchema = typeof InstalledBotSchema.Type

export class InstalledBotsResponse extends Schema.Class<InstalledBotsResponse>("InstalledBotsResponse")({
	bots: Schema.Array(InstalledBotSchema),
}) {}

// Available bot to install
export const AvailableBotSchema = Schema.Struct({
	id: Schema.String,
	name: Schema.String,
	displayName: Schema.String,
	description: Schema.String,
	avatar: Schema.NullOr(Schema.String),
	installed: Schema.Boolean,
})
export type AvailableBotSchema = typeof AvailableBotSchema.Type

export class AvailableBotsResponse extends Schema.Class<AvailableBotsResponse>("AvailableBotsResponse")({
	bots: Schema.Array(AvailableBotSchema),
}) {}

// ============ ERROR TYPES ============

export class BotNotInstalledError extends Schema.TaggedError<BotNotInstalledError>()("BotNotInstalledError", {
	botId: Schema.String,
}) {}

export class BotCommandNotFoundError extends Schema.TaggedError<BotCommandNotFoundError>()("BotCommandNotFoundError", {
	botId: Schema.String,
	commandName: Schema.String,
}) {}

export class BotExecutionError extends Schema.TaggedError<BotExecutionError>()("BotExecutionError", {
	botId: Schema.String,
	commandName: Schema.String,
	message: Schema.String,
}) {}

export class BotAlreadyInstalledError extends Schema.TaggedError<BotAlreadyInstalledError>()(
	"BotAlreadyInstalledError",
	{
		botId: Schema.String,
	},
) {}

export class BotNotFoundError extends Schema.TaggedError<BotNotFoundError>()("BotNotFoundError", {
	botId: Schema.String,
}) {}

// ============ API GROUP ============

export class BotsGroup extends HttpApiGroup.make("bots")
	// Get available commands for installed bots
	.add(
		HttpApiEndpoint.get("getAvailableCommands", `/:orgId/commands`)
			.addSuccess(AvailableBotCommandsResponse)
			.addError(UnauthorizedError)
			.addError(InternalServerError)
			.setPath(
				Schema.Struct({
					orgId: OrganizationId,
				}),
			)
			.annotateContext(
				OpenApi.annotations({
					title: "Get Available Bot Commands",
					description: "Get all slash commands available from installed bots",
					summary: "List bot commands",
				}),
			),
	)
	// Execute a bot command
	.add(
		HttpApiEndpoint.post("executeCommand", `/:orgId/:botId/commands/:commandName/execute`)
			.addSuccess(ExecuteBotCommandResponse)
			.addError(BotNotInstalledError)
			.addError(BotCommandNotFoundError)
			.addError(BotExecutionError)
			.addError(UnauthorizedError)
			.addError(InternalServerError)
			.setPath(
				Schema.Struct({
					orgId: OrganizationId,
					botId: Schema.String,
					commandName: Schema.String,
				}),
			)
			.setPayload(ExecuteBotCommandRequest)
			.annotateContext(
				OpenApi.annotations({
					title: "Execute Bot Command",
					description: "Execute a bot slash command",
					summary: "Execute bot command",
				}),
			),
	)
	// Get installed bots
	.add(
		HttpApiEndpoint.get("getInstalledBots", `/:orgId/installed`)
			.addSuccess(InstalledBotsResponse)
			.addError(UnauthorizedError)
			.addError(InternalServerError)
			.setPath(
				Schema.Struct({
					orgId: OrganizationId,
				}),
			)
			.annotateContext(
				OpenApi.annotations({
					title: "Get Installed Bots",
					description: "Get all bots installed in the organization",
					summary: "List installed bots",
				}),
			),
	)
	// Get all available bots (for install UI)
	.add(
		HttpApiEndpoint.get("getAvailableBots", `/:orgId/available`)
			.addSuccess(AvailableBotsResponse)
			.addError(UnauthorizedError)
			.addError(InternalServerError)
			.setPath(
				Schema.Struct({
					orgId: OrganizationId,
				}),
			)
			.annotateContext(
				OpenApi.annotations({
					title: "Get Available Bots",
					description: "Get all bots available for installation",
					summary: "List available bots",
				}),
			),
	)
	// Install a bot
	.add(
		HttpApiEndpoint.post("installBot", `/:orgId/:botId/install`)
			.addSuccess(InstalledBotSchema)
			.addError(BotNotFoundError)
			.addError(BotAlreadyInstalledError)
			.addError(UnauthorizedError)
			.addError(InternalServerError)
			.setPath(
				Schema.Struct({
					orgId: OrganizationId,
					botId: Schema.String,
				}),
			)
			.annotateContext(
				OpenApi.annotations({
					title: "Install Bot",
					description: "Install a bot in the organization",
					summary: "Install bot",
				}),
			),
	)
	// Uninstall a bot
	.add(
		HttpApiEndpoint.del("uninstallBot", `/:orgId/:botId`)
			.addSuccess(Schema.Void)
			.addError(BotNotInstalledError)
			.addError(UnauthorizedError)
			.addError(InternalServerError)
			.setPath(
				Schema.Struct({
					orgId: OrganizationId,
					botId: Schema.String,
				}),
			)
			.annotateContext(
				OpenApi.annotations({
					title: "Uninstall Bot",
					description: "Uninstall a bot from the organization",
					summary: "Uninstall bot",
				}),
			),
	)
	// Post a message as a bot (internal endpoint for bot actors)
	.add(
		HttpApiEndpoint.post("postBotMessage", `/:botId/messages`)
			.addSuccess(PostBotMessageResponse)
			.addError(InternalServerError)
			.setPath(
				Schema.Struct({
					botId: Schema.String,
				}),
			)
			.setPayload(PostBotMessageRequest)
			.annotateContext(
				OpenApi.annotations({
					title: "Post Bot Message",
					description: "Internal endpoint for bots to post messages to channels",
					summary: "Post bot message",
				}),
			),
	)
	.prefix("/bots")
	.middleware(CurrentUser.Authorization) {}
