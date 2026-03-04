import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform"
import { Schema } from "effect"
import * as CurrentUser from "../current-user.ts"
import { InternalServerError, UnauthorizedError } from "../errors.ts"
import { TransactionId } from "@hazel/schema"
import { RequiredScopes } from "../scopes/required-scopes"

export class GenerateMockDataRequest extends Schema.Class<GenerateMockDataRequest>("GenerateMockDataRequest")(
	{
		organizationId: Schema.UUID,
	},
) {}

export class GenerateMockDataResponse extends Schema.Class<GenerateMockDataResponse>(
	"GenerateMockDataResponse",
)({
	transactionId: TransactionId,
	created: Schema.Struct({
		users: Schema.Number,
		channels: Schema.Number,
		channelSections: Schema.Number,
		messages: Schema.Number,
		organizationMembers: Schema.Number,
		channelMembers: Schema.Number,
		threads: Schema.Number,
	}),
}) {}

export class MockDataGroup extends HttpApiGroup.make("mockData")
	.add(
		HttpApiEndpoint.post("generate")`/generate`
			.setPayload(GenerateMockDataRequest)
			.addSuccess(GenerateMockDataResponse)
			.addError(UnauthorizedError)
			.addError(InternalServerError)
			.annotateContext(
				OpenApi.annotations({
					title: "Generate Mock Data",
					description: "Generate mock data for an organization",
					summary: "Generate test data",
				}),
			)
			.annotate(RequiredScopes, ["organizations:write"]),
	)
	.prefix("/mock-data")
	.middleware(CurrentUser.Authorization) {}
