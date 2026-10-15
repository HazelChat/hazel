import { IntegrationConnection } from "@hazel/domain/models"
import { Schema } from "effect"
import { defineTaggedUnion } from "foldkit/schema"
import * as Interaction from "../../../ui/aria/interaction"

/** The user-level Discord connection row (`useUserIntegrationConnection`). */
export const DiscordConnection = Schema.Struct({
	status: IntegrationConnection.ConnectionStatus,
	externalAccountName: Schema.NullOr(Schema.String),
})
export type DiscordConnection = typeof DiscordConnection.Type

/** The Discord action in flight: redirecting to the OAuth page, or disconnecting. One at a time. */
export const Link = defineTaggedUnion({
	Idle: {},
	Linking: {},
	Unlinking: {},
})
export type Link = typeof Link.Type

export const Model = Schema.Struct({
	orgSlug: Schema.String,
	connection: Schema.NullOr(DiscordConnection),
	link: Link,
	interaction: Interaction.Model,
})
export type Model = typeof Model.Type
