import { Schema } from "effect"
import { Channel, ChannelMember, Message } from "./models"
import { BotId, ChannelId, OrganizationId, UserId } from "@hazel/schema"

export const BotGatewayDeliveryId = Schema.String

export const BotGatewayCommandInvokePayload = Schema.Struct({
	commandName: Schema.String,
	channelId: ChannelId,
	userId: UserId,
	orgId: OrganizationId,
	arguments: Schema.Record({ key: Schema.String, value: Schema.String }),
	timestamp: Schema.Number,
})
export type BotGatewayCommandInvokePayload = Schema.Schema.Type<
	typeof BotGatewayCommandInvokePayload
>

const BaseGatewayEnvelope = {
	schemaVersion: Schema.Literal(1),
	deliveryId: BotGatewayDeliveryId,
	partitionKey: Schema.String,
	occurredAt: Schema.Number,
	idempotencyKey: Schema.String,
}

export const BotGatewayCommandInvokeEnvelope = Schema.Struct({
	...BaseGatewayEnvelope,
	eventType: Schema.Literal("command.invoke"),
	payload: BotGatewayCommandInvokePayload,
})

export const BotGatewayMessageCreateEnvelope = Schema.Struct({
	...BaseGatewayEnvelope,
	eventType: Schema.Literal("message.create"),
	payload: Message.Model.json,
})

export const BotGatewayMessageUpdateEnvelope = Schema.Struct({
	...BaseGatewayEnvelope,
	eventType: Schema.Literal("message.update"),
	payload: Message.Model.json,
})

export const BotGatewayMessageDeleteEnvelope = Schema.Struct({
	...BaseGatewayEnvelope,
	eventType: Schema.Literal("message.delete"),
	payload: Message.Model.json,
})

export const BotGatewayChannelCreateEnvelope = Schema.Struct({
	...BaseGatewayEnvelope,
	eventType: Schema.Literal("channel.create"),
	payload: Channel.Model.json,
})

export const BotGatewayChannelUpdateEnvelope = Schema.Struct({
	...BaseGatewayEnvelope,
	eventType: Schema.Literal("channel.update"),
	payload: Channel.Model.json,
})

export const BotGatewayChannelDeleteEnvelope = Schema.Struct({
	...BaseGatewayEnvelope,
	eventType: Schema.Literal("channel.delete"),
	payload: Channel.Model.json,
})

export const BotGatewayChannelMemberAddEnvelope = Schema.Struct({
	...BaseGatewayEnvelope,
	eventType: Schema.Literal("channel_member.add"),
	payload: ChannelMember.Model.json,
})

export const BotGatewayChannelMemberRemoveEnvelope = Schema.Struct({
	...BaseGatewayEnvelope,
	eventType: Schema.Literal("channel_member.remove"),
	payload: ChannelMember.Model.json,
})

export const BotGatewayEnvelope = Schema.Union(
	BotGatewayCommandInvokeEnvelope,
	BotGatewayMessageCreateEnvelope,
	BotGatewayMessageUpdateEnvelope,
	BotGatewayMessageDeleteEnvelope,
	BotGatewayChannelCreateEnvelope,
	BotGatewayChannelUpdateEnvelope,
	BotGatewayChannelDeleteEnvelope,
	BotGatewayChannelMemberAddEnvelope,
	BotGatewayChannelMemberRemoveEnvelope,
)

export type BotGatewayEnvelope = Schema.Schema.Type<typeof BotGatewayEnvelope>
export type BotGatewayEventType = BotGatewayEnvelope["eventType"]

export const createBotGatewayPartitionKey = (params: {
	organizationId: OrganizationId
	channelId?: ChannelId | null
	botId?: BotId | null
}): string =>
	params.channelId
		? `org:${params.organizationId}:channel:${params.channelId}`
		: params.botId
			? `bot:${params.botId}`
			: `org:${params.organizationId}`
