import { AtomHttpApi } from "@effect-atom/atom-react"
import { HazelApi } from "@hazel/backend/api"
import { CustomFetchLive } from "./api-client"

export class HazelApiClient extends AtomHttpApi.Tag<HazelApiClient>()("HazelApiClient", {
	api: HazelApi,
	httpClient: CustomFetchLive,
	baseUrl: import.meta.env.VITE_BACKEND_URL || "http://localhost:3003",
}) {}
