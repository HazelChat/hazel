import { IntegrationConnectionId, MessageId, MessageIntegrationLinkId } from "@hazel/schema"
import { Schema } from "effect"
import { IntegrationProvider } from "./integration-connection-model"
import * as M from "./utils"
import { JsonDate } from "./utils"

export const LinkType = Schema.Literals(["created", "mentioned", "resolved", "linked"])
export type LinkType = Schema.Schema.Type<typeof LinkType>

export class Model extends M.Class<Model>("MessageIntegrationLink")({
	id: M.Generated(MessageIntegrationLinkId),
	messageId: MessageId,
	connectionId: IntegrationConnectionId,
	provider: IntegrationProvider,
	externalId: Schema.String,
	externalUrl: Schema.String,
	externalTitle: Schema.NullOr(Schema.String),
	linkType: LinkType,
	metadata: Schema.NullOr(Schema.Record(Schema.String, Schema.Unknown)),
	createdAt: M.Generated(JsonDate),
	updatedAt: M.Generated(JsonDate),
}) {}

export const Insert = Model.insert
export const Update = Model.update
