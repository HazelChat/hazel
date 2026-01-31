import { ErrorUtils, policy, type AgentSessionId } from "@hazel/domain"
import { Effect } from "effect"
import { AgentSessionRepo } from "../repositories/agent-session-repo"

/**
 * Agent Session Policy
 *
 * Users can only manage their own agent sessions.
 * No admin override is provided for security reasons.
 */
export class AgentSessionPolicy extends Effect.Service<AgentSessionPolicy>()("AgentSessionPolicy/Policy", {
	effect: Effect.gen(function* () {
		const policyEntity = "AgentSession" as const

		const agentSessionRepo = yield* AgentSessionRepo

		/**
		 * Users can create sessions in their own sandboxes.
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
						// Users can create sessions (sandbox ownership checked separately)
						return yield* Effect.succeed(true)
					}),
				),
			)

		/**
		 * Users can only view their own sessions.
		 */
		const canView = (id: AgentSessionId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"view",
			)(
				agentSessionRepo.with(id, (session) =>
					policy(
						policyEntity,
						"view",
						Effect.fn(`${policyEntity}.view`)(function* (actor) {
							return yield* Effect.succeed(session.userId === actor.id)
						}),
					),
				),
			)

		/**
		 * Users can only update their own sessions.
		 */
		const canUpdate = (id: AgentSessionId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"update",
			)(
				agentSessionRepo.with(id, (session) =>
					policy(
						policyEntity,
						"update",
						Effect.fn(`${policyEntity}.update`)(function* (actor) {
							return yield* Effect.succeed(session.userId === actor.id)
						}),
					),
				),
			)

		/**
		 * Users can only delete their own sessions.
		 */
		const canDelete = (id: AgentSessionId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"delete",
			)(
				agentSessionRepo.with(id, (session) =>
					policy(
						policyEntity,
						"delete",
						Effect.fn(`${policyEntity}.delete`)(function* (actor) {
							return yield* Effect.succeed(session.userId === actor.id)
						}),
					),
				),
			)

		return { canCreate, canView, canUpdate, canDelete } as const
	}),
	dependencies: [AgentSessionRepo.Default],
	accessors: true,
}) {}
