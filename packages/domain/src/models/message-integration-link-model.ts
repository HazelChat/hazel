import { IntegrationConnectionId, MessageId, MessageIntegrationLinkId } from "@hazel/schema"
import { Schema as S } from "effect"
import { IntegrationProvider } from "./integration-connection-model"
import * as M from "./utils"
import { JsonDate } from "./utils"

export const LinkType = S.Literals(["created", "mentioned", "resolved", "linked"])
export type LinkType = S.Schema.Type<typeof LinkType>

class Model extends M.Class<Model>("MessageIntegrationLink")({
	id: M.Generated(MessageIntegrationLinkId),
	messageId: MessageId,
	connectionId: IntegrationConnectionId,
	provider: IntegrationProvider,
	externalId: S.String,
	externalUrl: S.String,
	externalTitle: S.NullOr(S.String),
	linkType: LinkType,
	metadata: S.NullOr(S.Record(S.String, S.Unknown)),
	createdAt: M.Generated(JsonDate),
	updatedAt: M.Generated(JsonDate),
}) {}

export const { Insert, Update, Schema, Create, Patch } = M.expose(Model)
export type Type = typeof Schema.Type
