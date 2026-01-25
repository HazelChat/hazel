import { ChannelId, ExternalChannelLinkId, ExternalThreadLinkId } from "@hazel/schema"
import { Schema } from "effect"
import { IntegrationProvider } from "./integration-connection-model"
import * as M from "./utils"
import { JsonDate } from "./utils"

export class Model extends M.Class<Model>("ExternalThreadLink")({
	id: M.Generated(ExternalThreadLinkId),

	// Hazel thread
	hazelThreadId: ChannelId,

	// External thread
	provider: IntegrationProvider,
	externalThreadId: Schema.String,
	externalParentMessageId: Schema.NullOr(Schema.String),

	// Link to parent channel link
	channelLinkId: ExternalChannelLinkId,

	createdAt: M.Generated(JsonDate),
}) {}

export const Insert = Model.insert
export const Update = Model.update
