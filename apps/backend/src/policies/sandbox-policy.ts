import { ErrorUtils, policy, type SandboxId } from "@hazel/domain"
import { Effect } from "effect"
import { SandboxRepo } from "../repositories/sandbox-repo"

/**
 * Sandbox Policy
 *
 * Users can only manage their own sandboxes.
 * No admin override is provided for security reasons.
 */
export class SandboxPolicy extends Effect.Service<SandboxPolicy>()("SandboxPolicy/Policy", {
	effect: Effect.gen(function* () {
		const policyEntity = "Sandbox" as const

		const sandboxRepo = yield* SandboxRepo

		/**
		 * Users can create sandboxes for themselves.
		 */
		const canCreate = () =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"create",
			)(
				policy(
					policyEntity,
					"create",
					Effect.fn(`${policyEntity}.create`)(function* (_actor) {
						// Users can create their own sandboxes
						return yield* Effect.succeed(true)
					}),
				),
			)

		/**
		 * Users can only view their own sandboxes.
		 */
		const canView = (id: SandboxId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"view",
			)(
				sandboxRepo.with(id, (sandbox) =>
					policy(
						policyEntity,
						"view",
						Effect.fn(`${policyEntity}.view`)(function* (actor) {
							return yield* Effect.succeed(sandbox.userId === actor.id)
						}),
					),
				),
			)

		/**
		 * Users can only update their own sandboxes.
		 */
		const canUpdate = (id: SandboxId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"update",
			)(
				sandboxRepo.with(id, (sandbox) =>
					policy(
						policyEntity,
						"update",
						Effect.fn(`${policyEntity}.update`)(function* (actor) {
							return yield* Effect.succeed(sandbox.userId === actor.id)
						}),
					),
				),
			)

		/**
		 * Users can only delete their own sandboxes.
		 */
		const canDelete = (id: SandboxId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"delete",
			)(
				sandboxRepo.with(id, (sandbox) =>
					policy(
						policyEntity,
						"delete",
						Effect.fn(`${policyEntity}.delete`)(function* (actor) {
							return yield* Effect.succeed(sandbox.userId === actor.id)
						}),
					),
				),
			)

		return { canCreate, canView, canUpdate, canDelete } as const
	}),
	dependencies: [SandboxRepo.Default],
	accessors: true,
}) {}
