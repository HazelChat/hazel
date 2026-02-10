import { Effect } from "effect"
import { makePolicy } from "../lib/policy-utils"

export class UserPresenceStatusPolicy extends Effect.Service<UserPresenceStatusPolicy>()(
	"UserPresenceStatusPolicy/Policy",
	{
		effect: Effect.gen(function* () {
			const policyEntity = "UserPresenceStatus" as const
			const authorize = makePolicy(policyEntity)

			const canCreate = () => authorize("create", (_actor) => Effect.succeed(true))

			const canRead = () => authorize("select", (_actor) => Effect.succeed(true))

			const canUpdate = () => authorize("update", (_actor) => Effect.succeed(true))

			const canDelete = () => authorize("delete", (_actor) => Effect.succeed(true))

			return { canUpdate, canDelete, canRead, canCreate } as const
		}),
		dependencies: [],
		accessors: true,
	},
) {}
