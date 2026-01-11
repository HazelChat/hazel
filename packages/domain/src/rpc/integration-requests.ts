import { RpcGroup } from "@effect/rpc"
import { Schema } from "effect"
import { Rpc } from "effect-rpc-tanstack-devtools"
import { InternalServerError, UnauthorizedError } from "../errors"
import { IntegrationRequestId, OrganizationId } from "../ids"
import { IntegrationRequest } from "../models"
import { TransactionId } from "../transaction-id"
import { AuthMiddleware } from "./middleware"

/**
 * Response schema for successful integration request creation.
 */
export class IntegrationRequestResponse extends Schema.Class<IntegrationRequestResponse>(
	"IntegrationRequestResponse",
)({
	data: IntegrationRequest.Model.json,
	transactionId: TransactionId,
}) {}

/**
 * Payload for creating an integration request.
 */
export class CreateIntegrationRequestPayload extends Schema.Class<CreateIntegrationRequestPayload>(
	"CreateIntegrationRequestPayload",
)({
	organizationId: OrganizationId,
	integrationName: Schema.NonEmptyTrimmedString,
	integrationUrl: Schema.optional(Schema.String),
	description: Schema.optional(Schema.String),
}) {}

/**
 * Integration Request RPC Group
 *
 * Simple RPC for submitting integration requests.
 */
export class IntegrationRequestRpcs extends RpcGroup.make(
	Rpc.mutation("integrationRequest.create", {
		payload: CreateIntegrationRequestPayload,
		success: IntegrationRequestResponse,
		error: Schema.Union(UnauthorizedError, InternalServerError),
	}).middleware(AuthMiddleware),
) {}
