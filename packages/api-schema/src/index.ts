import { HttpApi } from "@effect/platform"
import { MessageApiGroup } from "./api/message.api"
import { RootApiGroup } from "./api/root.api"
import { ZeroApiGroup } from "./api/zero.api"

export * as Model from "./model"

export const MakiApi = HttpApi.make("MakiApi").add(RootApiGroup).add(MessageApiGroup).add(ZeroApiGroup.prefix("/zero"))
