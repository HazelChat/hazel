import { HttpApiBuilder } from "@effect/platform"
import { Effect } from "effect"
import { HazelApi } from "../api"

export const HttpRootLive = HttpApiBuilder.group(HazelApi, "root", (handlers) =>
	handlers.handle(
		"root",
		Effect.fnUntraced(function* () {
			return "Hello World"
		}),
	),
)
