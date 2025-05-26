import { HttpApiBuilder } from "@effect/platform"
import { Layer } from "effect"

import { MakiApi } from "@maki-chat/api-schema"
import { MessageApiLive } from "./http/message.http"
import { MainApiLive } from "./http/root.http"
import { ZeroApiLive } from "./http/zero.http"

export const HttpLive = HttpApiBuilder.api(MakiApi).pipe(
	Layer.provide(MainApiLive),
	Layer.provide(MessageApiLive),
	Layer.provide(ZeroApiLive),
)
