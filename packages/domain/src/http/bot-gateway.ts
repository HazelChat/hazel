import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform"
import { UnauthorizedError } from "../errors"
import { RequiredScopes } from "../scopes/required-scopes"

export class BotGatewayApiGroup extends HttpApiGroup.make("bot-gateway").add(
	HttpApiEndpoint.get("streamGateway", `/bot-gateway/stream`)
		.addError(UnauthorizedError)
		.annotateContext(
			OpenApi.annotations({
				title: "Stream Bot Gateway",
				description: "Durable bot gateway stream for receiving commands and Hazel events",
				summary: "Stream bot gateway events",
			}),
		)
		.annotate(RequiredScopes, []),
) {}
