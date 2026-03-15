import { HttpApi, OpenApi } from "effect/unstable/httpapi"
import { AppApi, LinkPreviewGroup, TweetGroup } from "./declare"

export class LinkPreviewApi extends HttpApi.make("api")
	.add(AppApi)
	.add(LinkPreviewGroup)
	.add(TweetGroup)
	.annotateContext(
		OpenApi.annotations({
			title: "Link Preview Worker API",
			description: "API for fetching link previews and tweet data",
		}),
	) {}
