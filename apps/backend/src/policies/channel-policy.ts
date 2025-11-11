import { type ChannelId, type OrganizationId, policy, policyCompose, UnauthorizedError } from "@hazel/domain"
import { Effect, pipe } from "effect"
import { ChannelRepo } from "../repositories/channel-repo"
import { OrganizationPolicy } from "./organization-policy"

export class ChannelPolicy extends Effect.Service<ChannelPolicy>()("ChannelPolicy/Policy", {
	effect: Effect.gen(function* () {
		const policyEntity = "Channel" as const

		const organizationPolicy = yield* OrganizationPolicy

		const channelRepo = yield* ChannelRepo

		const canCreate = (organizationId: OrganizationId) =>
			UnauthorizedError.refail(
				policyEntity,
				"create",
			)(
				pipe(
					organizationPolicy.isMember(organizationId),
					policyCompose(policy(policyEntity, "create", (_actor) => Effect.succeed(true))),
				),
			)

		const canUpdate = (id: ChannelId) =>
			UnauthorizedError.refail(
				policyEntity,
				"update",
			)(
				channelRepo.with(id, (channel) =>
					pipe(
						organizationPolicy.canUpdate(channel.organizationId),
						policyCompose(policy(policyEntity, "update", (_actor) => Effect.succeed(true))),
					),
				),
			)

		const canDelete = (id: ChannelId) =>
			UnauthorizedError.refail(
				policyEntity,
				"delete",
			)(
				channelRepo.with(id, (channel) =>
					pipe(
						organizationPolicy.canUpdate(channel.organizationId),
						policyCompose(policy(policyEntity, "delete", (_actor) => Effect.succeed(true))),
					),
				),
			)

		return { canUpdate, canDelete, canCreate } as const
	}),
	dependencies: [ChannelRepo.Default, OrganizationPolicy.Default],
	accessors: true,
}) {}
