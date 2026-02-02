import { NotificationRepo, OrganizationMemberRepo } from "@hazel/backend-core"
import {
	ErrorUtils,
	type NotificationId,
	type OrganizationMemberId,
	policy,
	withSystemActor,
} from "@hazel/domain"
import { Effect, Option } from "effect"
import { isAdminOrOwner } from "../lib/policy-utils"

export class NotificationPolicy extends Effect.Service<NotificationPolicy>()("NotificationPolicy/Policy", {
	effect: Effect.gen(function* () {
		const policyEntity = "Notification" as const

		const notificationRepo = yield* NotificationRepo
		const organizationMemberRepo = yield* OrganizationMemberRepo

		const canCreate = (_memberId: OrganizationMemberId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"create",
			)(
				policy(
					policyEntity,
					"create",
					Effect.fn(`${policyEntity}.create`)(function* (_actor) {
						// Notifications are typically created by the system
						// This could be restricted to system actors only
						return yield* Effect.succeed(true)
					}),
				),
			)

		const canView = (id: NotificationId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"view",
			)(
				notificationRepo.with(id, (notification) =>
					policy(
						policyEntity,
						"view",
						Effect.fn(`${policyEntity}.view`)(function* (actor) {
							// Get the member for this notification
							const member = yield* organizationMemberRepo.findById(notification.memberId)

							if (Option.isSome(member) && member.value.userId === actor.id) {
								return yield* Effect.succeed(true)
							}

							return yield* Effect.succeed(false)
						}),
					),
				),
			)

		const canUpdate = (id: NotificationId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"update",
			)(
				notificationRepo.with(id, (notification) =>
					organizationMemberRepo.with(notification.memberId, (member) =>
						policy(
							policyEntity,
							"update",
							Effect.fn(`${policyEntity}.update`)(function* (actor) {
								// Users can update their own notifications
								if (member.userId === actor.id) {
									return yield* Effect.succeed(true)
								}

								// Check if actor is an admin/owner in the organization
								const actorMember = yield* organizationMemberRepo
									.findByOrgAndUser(member.organizationId, actor.id)
									.pipe(withSystemActor)

								if (Option.isSome(actorMember)) {
									return yield* Effect.succeed(isAdminOrOwner(actorMember.value.role))
								}

								return yield* Effect.succeed(false)
							}),
						),
					),
				),
			)

		const canDelete = (id: NotificationId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"delete",
			)(
				notificationRepo.with(id, (notification) =>
					organizationMemberRepo.with(notification.memberId, (member) =>
						policy(
							policyEntity,
							"delete",
							Effect.fn(`${policyEntity}.delete`)(function* (actor) {
								// Users can delete their own notifications
								if (member.userId === actor.id) {
									return yield* Effect.succeed(true)
								}

								// Check if actor is an admin/owner in the organization
								const actorMember = yield* organizationMemberRepo
									.findByOrgAndUser(member.organizationId, actor.id)
									.pipe(withSystemActor)

								if (Option.isSome(actorMember)) {
									return yield* Effect.succeed(isAdminOrOwner(actorMember.value.role))
								}

								return yield* Effect.succeed(false)
							}),
						),
					),
				),
			)

		const canMarkAsRead = (id: NotificationId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"markAsRead",
			)(
				notificationRepo.with(id, (notification) =>
					organizationMemberRepo.with(notification.memberId, (member) =>
						policy(
							policyEntity,
							"markAsRead",
							Effect.fn(`${policyEntity}.markAsRead`)(function* (actor) {
								// Users can mark their own notifications as read
								if (member.userId === actor.id) {
									return yield* Effect.succeed(true)
								}

								// Check if actor is an admin/owner in the organization
								const actorMember = yield* organizationMemberRepo
									.findByOrgAndUser(member.organizationId, actor.id)
									.pipe(withSystemActor)

								if (Option.isSome(actorMember)) {
									return yield* Effect.succeed(isAdminOrOwner(actorMember.value.role))
								}

								return yield* Effect.succeed(false)
							}),
						),
					),
				),
			)

		const canMarkAllAsRead = (memberId: OrganizationMemberId) =>
			ErrorUtils.refailUnauthorized(
				policyEntity,
				"markAllAsRead",
			)(
				organizationMemberRepo.with(memberId, (member) =>
					policy(
						policyEntity,
						"markAllAsRead",
						Effect.fn(`${policyEntity}.markAllAsRead`)(function* (actor) {
							// Users can mark all their own notifications as read
							if (member.userId === actor.id) {
								return yield* Effect.succeed(true)
							}

							// Check if actor is an admin/owner in the organization
							const actorMember = yield* organizationMemberRepo
								.findByOrgAndUser(member.organizationId, actor.id)
								.pipe(withSystemActor)

							if (Option.isSome(actorMember)) {
								return yield* Effect.succeed(
									actorMember.value.role === "admin" || actorMember.value.role === "owner",
								)
							}

							return yield* Effect.succeed(false)
						}),
					),
				),
			)

		return { canCreate, canView, canUpdate, canDelete, canMarkAsRead, canMarkAllAsRead } as const
	}),
	dependencies: [NotificationRepo.Default, OrganizationMemberRepo.Default],
	accessors: true,
}) {}
