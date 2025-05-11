import { HttpApiBuilder } from "@effect/platform"
import { Effect } from "effect"
import { nanoid } from "nanoid"

import { MakiApi } from "@maki-chat/api-schema"

export const RootLive = HttpApiBuilder.group(MakiApi, "Root", (handlers) =>
	Effect.gen(function* () {
		return handlers
			.handle("root", () => Effect.succeed("Maki Chat API"))
			.handle("upload", () =>
				Effect.gen(function* () {
					const uniqueId = nanoid()
					return yield* Effect.succeed("Uploaded Files")
				}),
			)
	}),
)
