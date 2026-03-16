import { FetchHttpClient } from "effect/unstable/http"
import { AtomHttpApi } from "effect/unstable/reactivity"

import { LinkPreviewApi } from "@hazel/link-preview-worker"

export class LinkPreviewClient extends AtomHttpApi.Service<LinkPreviewClient>()("LinkPreviewClient", {
	api: LinkPreviewApi,
	httpClient: FetchHttpClient.layer,
	baseUrl: "https://link-preview.hazel.sh",
}) {}
