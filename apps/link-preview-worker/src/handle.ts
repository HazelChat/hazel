import { HttpApiBuilder } from "@effect/platform"
import { Effect } from "effect"
import { LinkPreviewApi } from "./api"
import { HttpLinkPreviewLive } from "./handlers/link-preview"
import { HttpTweetLive } from "./handlers/tweet"

export const HttpAppLive = HttpApiBuilder.group(LinkPreviewApi, "app", (handles) =>
	Effect.gen(function* () {
		yield* Effect.log("Link Preview Worker started")

		return handles.handle("health", () => Effect.succeed("ok"))
	}),
)

export { HttpLinkPreviewLive, HttpTweetLive }
