import { policy, UnauthorizedError } from "@hazel/effect-lib"
import { Effect } from "effect"

export class UserPresenceStatusPolicy extends Effect.Service<UserPresenceStatusPolicy>()(
	"UserPresenceStatusPolicy/Policy",
	{
		effect: Effect.gen(function* () {
			const policyEntity = "UserPresenceStatus" as const

			const canCreate = () =>
				UnauthorizedError.refail(
					policyEntity,
					"create",
				)(policy(policyEntity, "create", (_actor) => Effect.succeed(true)))

			const canRead = () =>
				UnauthorizedError.refail(
					policyEntity,
					"select",
				)(policy(policyEntity, "select", (_actor) => Effect.succeed(true)))

			const canUpdate = () =>
				UnauthorizedError.refail(
					policyEntity,
					"update",
				)(policy(policyEntity, "update", (_actor) => Effect.succeed(true)))

			const canDelete = () =>
				UnauthorizedError.refail(
					policyEntity,
					"delete",
				)(policy(policyEntity, "delete", (_actor) => Effect.succeed(true)))

			return { canUpdate, canDelete, canRead, canCreate } as const
		}),
		dependencies: [],
		accessors: true,
	},
) {}
