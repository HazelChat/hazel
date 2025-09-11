import { HttpApiMiddleware, HttpApiSecurity } from "@effect/platform"
import { UserId } from "@hazel/db/schema"
import { Context, Schema } from "effect"
import { UnauthorizedError } from "./errors"

export class User extends Schema.Class<User>("User")({
	id: UserId,
	role: Schema.Literal("admin", "member"),
}) {}

export class CurrentUser extends Context.Tag("CurrentUser")<CurrentUser, User>() {}

export class Authorization extends HttpApiMiddleware.Tag<Authorization>()("Authorization", {
	failure: UnauthorizedError,
	provides: CurrentUser,
	security: {
		bearer: HttpApiSecurity.bearer,
	},
}) {}
