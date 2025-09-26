import { policy, UnauthorizedError, type UserId } from "@hazel/effect-lib"
import { Effect } from "effect"

export class UserPolicy extends Effect.Service<UserPolicy>()("UserPolicy/Policy", {
	effect: Effect.gen(function* () {
		const policyEntity = "User" as const

		const canUpdate = (id: UserId) =>
			UnauthorizedError.refail(
				policyEntity,
				"update",
			)(policy(policyEntity, "update", (actor) => Effect.succeed(actor.id === id)))

		const canDelete = (id: UserId) =>
			UnauthorizedError.refail(
				policyEntity,
				"delete",
			)(policy(policyEntity, "delete", (actor) => Effect.succeed(actor.id === id)))

		return { canUpdate, canDelete } as const
	}),
	dependencies: [],
	accessors: true,
}) {}
