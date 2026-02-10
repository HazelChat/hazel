import type { UserId } from "@hazel/schema"
import { Effect } from "effect"
import { makePolicy } from "../lib/policy-utils"

export class UserPolicy extends Effect.Service<UserPolicy>()("UserPolicy/Policy", {
	effect: Effect.gen(function* () {
		const policyEntity = "User" as const
		const authorize = makePolicy(policyEntity)

		const canRead = (_id: UserId) => authorize("select", (_actor) => Effect.succeed(true))

		const canCreate = () => authorize("create", (_actor) => Effect.succeed(true))

		const canUpdate = (id: UserId) => authorize("update", (actor) => Effect.succeed(actor.id === id))

		const canDelete = (id: UserId) => authorize("delete", (actor) => Effect.succeed(actor.id === id))

		return { canCreate, canUpdate, canDelete, canRead } as const
	}),
	dependencies: [],
	accessors: true,
}) {}
