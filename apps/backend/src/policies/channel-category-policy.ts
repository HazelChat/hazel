import { type ChannelCategoryId, ErrorUtils, type OrganizationId, policy, policyCompose } from "@hazel/domain"
import { Effect, pipe } from "effect"
import { ChannelCategoryRepo } from "../repositories/channel-category-repo"
import { OrganizationPolicy } from "./organization-policy"

export class ChannelCategoryPolicy extends Effect.Service<ChannelCategoryPolicy>()("ChannelCategoryPolicy/Policy", {
	effect: Effect.gen(function* () {
		const policyEntity = "ChannelCategory" as const

		const organizationPolicy = yield* OrganizationPolicy

		const channelCategoryRepo = yield* ChannelCategoryRepo

		const canCreate = (organizationId: OrganizationId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"create",
			)(
				pipe(
					organizationPolicy.isMember(organizationId),
					policyCompose(policy(policyEntity, "create", (_actor) => Effect.succeed(true))),
				),
			)

		const canUpdate = (id: ChannelCategoryId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"update",
			)(
				channelCategoryRepo.with(id, (category) =>
					pipe(
						organizationPolicy.isMember(category.organizationId),
						policyCompose(policy(policyEntity, "update", (_actor) => Effect.succeed(true))),
					),
				),
			)

		const canDelete = (id: ChannelCategoryId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"delete",
			)(
				channelCategoryRepo.with(id, (category) =>
					pipe(
						organizationPolicy.isMember(category.organizationId),
						policyCompose(policy(policyEntity, "delete", (_actor) => Effect.succeed(true))),
					),
				),
			)

		const canList = (organizationId: OrganizationId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"select",
			)(
				pipe(
					organizationPolicy.isMember(organizationId),
					policyCompose(policy(policyEntity, "select", (_actor) => Effect.succeed(true))),
				),
			)

		return { canCreate, canUpdate, canDelete, canList } as const
	}),
	dependencies: [ChannelCategoryRepo.Default, OrganizationPolicy.Default],
	accessors: true,
}) {}
