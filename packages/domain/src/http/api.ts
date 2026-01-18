import { HttpApi, OpenApi } from "@effect/platform"
import { MessagesApiGroup } from "./api-v1/messages"
import { AuthGroup } from "./auth"
import { BotCommandsApiGroup } from "./bot-commands"
import { IncomingWebhookGroup } from "./incoming-webhooks"
import { IntegrationCommandGroup } from "./integration-commands"
import { IntegrationResourceGroup } from "./integration-resources"
import { IntegrationGroup } from "./integrations"
import { MockDataGroup } from "./mock-data"
import { PresencePublicGroup } from "./presence"
import { RootGroup } from "./root"
import { UploadsGroup } from "./uploads"
import { WebhookGroup } from "./webhooks"

export class HazelApi extends HttpApi.make("HazelApp")
	.add(MessagesApiGroup)
	.add(BotCommandsApiGroup)
	.add(PresencePublicGroup)
	.add(RootGroup)
	.add(AuthGroup)
	.add(IntegrationGroup)
	.add(IntegrationCommandGroup)
	.add(IntegrationResourceGroup)
	.add(IncomingWebhookGroup)
	.add(UploadsGroup)
	.add(WebhookGroup)
	.add(MockDataGroup)
	.annotateContext(
		OpenApi.annotations({
			title: "Hazel Chat API",
			description: "API for the Hazel chat application",
			version: "1.0.0",
		}),
	) {}
