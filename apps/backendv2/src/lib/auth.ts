import { HttpApiMiddleware, HttpApiSecurity } from "@effect/platform"
import { Context, Schema } from "effect"
import { UnauthorizedError } from "./errors"
import { OrganizationId, UserId } from "./schema"

export class User extends Schema.Class<User>("User")({
	id: UserId,
	organizationId: OrganizationId,
}) {}

export class CurrentUser extends Context.Tag("CurrentUser")<CurrentUser, User>() {}

export class Authorization extends HttpApiMiddleware.Tag<Authorization>()("Authorization", {
	failure: UnauthorizedError,
	provides: CurrentUser,
	security: {
		bearer: HttpApiSecurity.bearer,
	},
}) {}
