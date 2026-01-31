import { ErrorUtils, policy, type UserCredentialId } from "@hazel/domain"
import { Effect, Option } from "effect"
import { UserCredentialRepo } from "../repositories/user-credential-repo"

/**
 * User Credential Policy
 *
 * Users can only manage their own credentials.
 * No admin override is provided for security reasons.
 */
export class UserCredentialPolicy extends Effect.Service<UserCredentialPolicy>()(
	"UserCredentialPolicy/Policy",
	{
		effect: Effect.gen(function* () {
			const policyEntity = "UserCredential" as const

			const userCredentialRepo = yield* UserCredentialRepo

			/**
			 * Users can create credentials for themselves.
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
							// Users can create their own credentials
							return yield* Effect.succeed(true)
						}),
					),
				)

			/**
			 * Users can only view their own credentials.
			 */
			const canView = (id: UserCredentialId) =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"view",
				)(
					userCredentialRepo.with(id, (credential) =>
						policy(
							policyEntity,
							"view",
							Effect.fn(`${policyEntity}.view`)(function* (actor) {
								return yield* Effect.succeed(credential.userId === actor.id)
							}),
						),
					),
				)

			/**
			 * Users can only update their own credentials.
			 */
			const canUpdate = (id: UserCredentialId) =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"update",
				)(
					userCredentialRepo.with(id, (credential) =>
						policy(
							policyEntity,
							"update",
							Effect.fn(`${policyEntity}.update`)(function* (actor) {
								return yield* Effect.succeed(credential.userId === actor.id)
							}),
						),
					),
				)

			/**
			 * Users can only delete their own credentials.
			 */
			const canDelete = (id: UserCredentialId) =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"delete",
				)(
					userCredentialRepo.with(id, (credential) =>
						policy(
							policyEntity,
							"delete",
							Effect.fn(`${policyEntity}.delete`)(function* (actor) {
								return yield* Effect.succeed(credential.userId === actor.id)
							}),
						),
					),
				)

			return { canCreate, canView, canUpdate, canDelete } as const
		}),
		dependencies: [UserCredentialRepo.Default],
		accessors: true,
	},
) {}
