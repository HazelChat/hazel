import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
import { Schema } from "effect"
import { RequiredScopes } from "../scopes/required-scopes"

export class RootGroup extends HttpApiGroup.make("root").add(
	HttpApiEndpoint.get("root")`/`.addSuccess(Schema.String).annotate(RequiredScopes, []),
) {}
