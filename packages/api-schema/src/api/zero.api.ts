import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
import { Schema } from "effect"
import { Authorization } from "../authorization"

export const ZeroApiGroup = HttpApiGroup.make("Zero")
	.add(HttpApiEndpoint.post("push")`/push`.addSuccess(Schema.Any))
	.middleware(Authorization)
