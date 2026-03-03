import { describe, expect, it } from "@effect/vitest"
import { NotificationRepo, OrganizationMemberRepo } from "@hazel/backend-core"
import { UnauthorizedError } from "@hazel/domain"
import type { NotificationId, OrganizationId, OrganizationMemberId, UserId } from "@hazel/schema"
import { Effect, Either, Layer, Option } from "effect"
import { NotificationPolicy } from "./notification-policy.ts"
import {
	makeActor,
	makeEntityNotFound,
	makeOrgResolverLayer,
	runWithActorEither,
	TEST_ORG_ID,
} from "./policy-test-helpers.ts"

type Role = "admin" | "member" | "owner"

const NOTIFICATION_ID = "00000000-0000-0000-0000-000000000841" as NotificationId
const MEMBER_ID = "00000000-0000-0000-0000-000000000842" as OrganizationMemberId
const ADMIN_USER_ID = "00000000-0000-0000-0000-000000000843" as UserId
const OTHER_USER_ID = "00000000-0000-0000-0000-000000000844" as UserId

type NotificationData = { memberId: OrganizationMemberId }
type MemberData = { userId: UserId; organizationId: OrganizationId; role: string }

const makeNotificationRepoLayer = (notifications: Record<string, NotificationData>) =>
	Layer.succeed(NotificationRepo, {
		with: <A, E, R>(
			id: NotificationId,
			f: (notification: NotificationData) => Effect.Effect<A, E, R>,
		) => {
			const notification = notifications[id]
			if (!notification) return Effect.fail(makeEntityNotFound("Notification"))
			return f(notification)
		},
	} as unknown as NotificationRepo)

const makeOrgMemberRepoLayer = (
	members: Record<string, MemberData>,
	orgMembers: Record<string, Role>,
) =>
	Layer.succeed(OrganizationMemberRepo, {
		with: <A, E, R>(id: OrganizationMemberId, f: (m: MemberData) => Effect.Effect<A, E, R>) => {
			const member = members[id]
			if (!member) return Effect.fail(makeEntityNotFound("OrganizationMember"))
			return f(member)
		},
		findById: (id: OrganizationMemberId) => {
			const member = members[id]
			return Effect.succeed(member ? Option.some(member) : Option.none())
		},
		findByOrgAndUser: (organizationId: OrganizationId, userId: UserId) => {
			const role = orgMembers[`${organizationId}:${userId}`]
			return Effect.succeed(role ? Option.some({ organizationId, userId, role }) : Option.none())
		},
	} as unknown as OrganizationMemberRepo)

const makePolicyLayer = (
	notifications: Record<string, NotificationData>,
	members: Record<string, MemberData>,
	orgMembers: Record<string, Role>,
) =>
	NotificationPolicy.DefaultWithoutDependencies.pipe(
		Layer.provide(makeNotificationRepoLayer(notifications)),
		Layer.provide(makeOrgMemberRepoLayer(members, orgMembers)),
		Layer.provide(makeOrgResolverLayer(orgMembers)),
	)

describe("NotificationPolicy", () => {
	it("canCreate allows any authenticated user", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer({}, {}, {})

		const result = await runWithActorEither(
			NotificationPolicy.canCreate(MEMBER_ID),
			layer,
			actor,
		)
		expect(Either.isRight(result)).toBe(true)
	})

	it("canView allows notification owner", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer(
			{ [NOTIFICATION_ID]: { memberId: MEMBER_ID } },
			{ [MEMBER_ID]: { userId: actor.id, organizationId: TEST_ORG_ID, role: "member" } },
			{},
		)

		const result = await runWithActorEither(
			NotificationPolicy.canView(NOTIFICATION_ID),
			layer,
			actor,
		)
		expect(Either.isRight(result)).toBe(true)
	})

	it("canView denies other user", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer(
			{ [NOTIFICATION_ID]: { memberId: MEMBER_ID } },
			{ [MEMBER_ID]: { userId: OTHER_USER_ID, organizationId: TEST_ORG_ID, role: "member" } },
			{},
		)

		const result = await runWithActorEither(
			NotificationPolicy.canView(NOTIFICATION_ID),
			layer,
			actor,
		)
		expect(Either.isLeft(result)).toBe(true)
	})

	it("canUpdate allows notification owner", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer(
			{ [NOTIFICATION_ID]: { memberId: MEMBER_ID } },
			{ [MEMBER_ID]: { userId: actor.id, organizationId: TEST_ORG_ID, role: "member" } },
			{ [`${TEST_ORG_ID}:${actor.id}`]: "member" },
		)

		const result = await runWithActorEither(
			NotificationPolicy.canUpdate(NOTIFICATION_ID),
			layer,
			actor,
		)
		expect(Either.isRight(result)).toBe(true)
	})

	it("canUpdate allows org admin", async () => {
		const admin = makeActor({ id: ADMIN_USER_ID })
		const layer = makePolicyLayer(
			{ [NOTIFICATION_ID]: { memberId: MEMBER_ID } },
			{ [MEMBER_ID]: { userId: OTHER_USER_ID, organizationId: TEST_ORG_ID, role: "member" } },
			{ [`${TEST_ORG_ID}:${ADMIN_USER_ID}`]: "admin" },
		)

		const result = await runWithActorEither(
			NotificationPolicy.canUpdate(NOTIFICATION_ID),
			layer,
			admin,
		)
		expect(Either.isRight(result)).toBe(true)
	})

	it("canUpdate denies non-owner non-admin", async () => {
		const outsider = makeActor({ id: OTHER_USER_ID })
		const layer = makePolicyLayer(
			{ [NOTIFICATION_ID]: { memberId: MEMBER_ID } },
			{ [MEMBER_ID]: { userId: "00000000-0000-0000-0000-000000000849" as UserId, organizationId: TEST_ORG_ID, role: "member" } },
			{ [`${TEST_ORG_ID}:${OTHER_USER_ID}`]: "member" },
		)

		const result = await runWithActorEither(
			NotificationPolicy.canUpdate(NOTIFICATION_ID),
			layer,
			outsider,
		)
		expect(Either.isLeft(result)).toBe(true)
	})

	it("canDelete allows notification owner", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer(
			{ [NOTIFICATION_ID]: { memberId: MEMBER_ID } },
			{ [MEMBER_ID]: { userId: actor.id, organizationId: TEST_ORG_ID, role: "member" } },
			{ [`${TEST_ORG_ID}:${actor.id}`]: "member" },
		)

		const result = await runWithActorEither(
			NotificationPolicy.canDelete(NOTIFICATION_ID),
			layer,
			actor,
		)
		expect(Either.isRight(result)).toBe(true)
	})

	it("canDelete allows org admin", async () => {
		const admin = makeActor({ id: ADMIN_USER_ID })
		const layer = makePolicyLayer(
			{ [NOTIFICATION_ID]: { memberId: MEMBER_ID } },
			{ [MEMBER_ID]: { userId: OTHER_USER_ID, organizationId: TEST_ORG_ID, role: "member" } },
			{ [`${TEST_ORG_ID}:${ADMIN_USER_ID}`]: "admin" },
		)

		const result = await runWithActorEither(
			NotificationPolicy.canDelete(NOTIFICATION_ID),
			layer,
			admin,
		)
		expect(Either.isRight(result)).toBe(true)
	})

	it("canMarkAsRead allows notification owner", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer(
			{ [NOTIFICATION_ID]: { memberId: MEMBER_ID } },
			{ [MEMBER_ID]: { userId: actor.id, organizationId: TEST_ORG_ID, role: "member" } },
			{ [`${TEST_ORG_ID}:${actor.id}`]: "member" },
		)

		const result = await runWithActorEither(
			NotificationPolicy.canMarkAsRead(NOTIFICATION_ID),
			layer,
			actor,
		)
		expect(Either.isRight(result)).toBe(true)
	})

	it("canMarkAllAsRead allows member owner", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer(
			{},
			{ [MEMBER_ID]: { userId: actor.id, organizationId: TEST_ORG_ID, role: "member" } },
			{ [`${TEST_ORG_ID}:${actor.id}`]: "member" },
		)

		const result = await runWithActorEither(
			NotificationPolicy.canMarkAllAsRead(MEMBER_ID),
			layer,
			actor,
		)
		expect(Either.isRight(result)).toBe(true)
	})

	it("canMarkAllAsRead allows org admin", async () => {
		const admin = makeActor({ id: ADMIN_USER_ID })
		const layer = makePolicyLayer(
			{},
			{ [MEMBER_ID]: { userId: OTHER_USER_ID, organizationId: TEST_ORG_ID, role: "member" } },
			{ [`${TEST_ORG_ID}:${ADMIN_USER_ID}`]: "admin" },
		)

		const result = await runWithActorEither(
			NotificationPolicy.canMarkAllAsRead(MEMBER_ID),
			layer,
			admin,
		)
		expect(Either.isRight(result)).toBe(true)
	})

	it("canMarkAllAsRead denies outsider", async () => {
		const outsider = makeActor({ id: OTHER_USER_ID })
		const layer = makePolicyLayer(
			{},
			{ [MEMBER_ID]: { userId: "00000000-0000-0000-0000-000000000849" as UserId, organizationId: TEST_ORG_ID, role: "member" } },
			{},
		)

		const result = await runWithActorEither(
			NotificationPolicy.canMarkAllAsRead(MEMBER_ID),
			layer,
			outsider,
		)
		expect(Either.isLeft(result)).toBe(true)
	})
})
