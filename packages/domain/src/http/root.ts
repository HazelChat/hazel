import { HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi"
import { Schema } from "effect"
import { RequiredScopes } from "../scopes/required-scopes"

export class RootGroup extends HttpApiGroup.make("root").add(
	HttpApiEndpoint.get("root", "/", { success: Schema.String }).annotate(RequiredScopes, []),
) {}
