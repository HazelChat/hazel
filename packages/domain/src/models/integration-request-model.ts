import { IntegrationRequestId, OrganizationId, UserId } from "@hazel/schema"
import { Schema } from "effect"
import * as M from "./utils"
import { JsonDate } from "./utils"

export const IntegrationRequestStatus = Schema.Literal("pending", "reviewed", "planned", "rejected")
export type IntegrationRequestStatus = Schema.Schema.Type<typeof IntegrationRequestStatus>

export class Model extends M.Class<Model>("IntegrationRequest")({
	id: M.Generated(IntegrationRequestId),
	organizationId: OrganizationId,
	requestedBy: UserId,
	integrationName: Schema.NonEmptyTrimmedString,
	integrationUrl: Schema.NullOr(Schema.String),
	description: Schema.NullOr(Schema.String),
	status: IntegrationRequestStatus,
	createdAt: M.Generated(JsonDate),
	updatedAt: M.Generated(JsonDate),
}) {}

export const Insert = Model.insert
export const Update = Model.update
