import { describe, expect, it } from "@effect/vitest"
import { OrganizationMemberRepo } from "@hazel/backend-core"
import { UnauthorizedError } from "@hazel/domain"
import type { OrganizationId, OrganizationMemberId, UserId } from "@hazel/schema"
import { Effect, Either, Layer, Option } from "effect"
import { OrganizationMemberPolicy } from "./organization-member-policy.ts"
import {
	makeActor,
	makeEntityNotFound,
	makeOrgResolverLayer,
	runWithActorEither,
	TEST_ORG_ID,
} from "./policy-test-helpers.ts"

type Role = "admin" | "member" | "owner"

const MEMBER_ID = "00000000-0000-0000-0000-000000000851" as OrganizationMemberId
const TARGET_USER_ID = "00000000-0000-0000-0000-000000000852" as UserId
const ADMIN_USER_ID = "00000000-0000-0000-0000-000000000853" as UserId
const OWNER_USER_ID = "00000000-0000-0000-0000-000000000854" as UserId

type MemberData = { userId: UserId; organizationId: OrganizationId; role: string }

const makeOrgMemberRepoLayer = (
	membersById: Record<string, MemberData>,
	orgMembers: Record<string, Role>,
) =>
	Layer.succeed(OrganizationMemberRepo, {
		with: <A, E, R>(id: OrganizationMemberId, f: (m: MemberData) => Effect.Effect<A, E, R>) => {
			const member = membersById[id]
			if (!member) return Effect.fail(makeEntityNotFound("OrganizationMember"))
			return f(member)
		},
		findByOrgAndUser: (organizationId: OrganizationId, userId: UserId) => {
			const role = orgMembers[`${organizationId}:${userId}`]
			return Effect.succeed(role ? Option.some({ organizationId, userId, role }) : Option.none())
		},
	} as unknown as OrganizationMemberRepo)

const makePolicyLayer = (
	membersById: Record<string, MemberData>,
	orgMembers: Record<string, Role>,
) =>
	OrganizationMemberPolicy.DefaultWithoutDependencies.pipe(
		Layer.provide(makeOrgMemberRepoLayer(membersById, orgMembers)),
		Layer.provide(makeOrgResolverLayer(orgMembers)),
	)

describe("OrganizationMemberPolicy", () => {
	it("canCreate allows non-member to join", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer({}, {})

		const result = await runWithActorEither(
			OrganizationMemberPolicy.canCreate(TEST_ORG_ID),
			layer,
			actor,
		)
		expect(Either.isRight(result)).toBe(true)
	})

	it("canCreate denies already-existing member", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer(
			{},
			{ [`${TEST_ORG_ID}:${actor.id}`]: "member" },
		)

		const result = await runWithActorEither(
			OrganizationMemberPolicy.canCreate(TEST_ORG_ID),
			layer,
			actor,
		)
		expect(Either.isLeft(result)).toBe(true)
	})

	it("canUpdate allows self-update", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer(
			{ [MEMBER_ID]: { userId: actor.id, organizationId: TEST_ORG_ID, role: "member" } },
			{ [`${TEST_ORG_ID}:${actor.id}`]: "member" },
		)

		const result = await runWithActorEither(
			OrganizationMemberPolicy.canUpdate(MEMBER_ID),
			layer,
			actor,
		)
		expect(Either.isRight(result)).toBe(true)
	})

	it("canUpdate allows org admin", async () => {
		const admin = makeActor({ id: ADMIN_USER_ID })
		const layer = makePolicyLayer(
			{ [MEMBER_ID]: { userId: TARGET_USER_ID, organizationId: TEST_ORG_ID, role: "member" } },
			{ [`${TEST_ORG_ID}:${ADMIN_USER_ID}`]: "admin" },
		)

		const result = await runWithActorEither(
			OrganizationMemberPolicy.canUpdate(MEMBER_ID),
			layer,
			admin,
		)
		expect(Either.isRight(result)).toBe(true)
	})

	it("canUpdate denies org owner (only admin allowed)", async () => {
		const owner = makeActor({ id: OWNER_USER_ID })
		const layer = makePolicyLayer(
			{ [MEMBER_ID]: { userId: TARGET_USER_ID, organizationId: TEST_ORG_ID, role: "member" } },
			{ [`${TEST_ORG_ID}:${OWNER_USER_ID}`]: "owner" },
		)

		const result = await runWithActorEither(
			OrganizationMemberPolicy.canUpdate(MEMBER_ID),
			layer,
			owner,
		)
		expect(Either.isLeft(result)).toBe(true)
		if (Either.isLeft(result)) {
			expect(UnauthorizedError.is(result.left)).toBe(true)
		}
	})

	it("canUpdate denies outsider", async () => {
		const outsider = makeActor({ id: "00000000-0000-0000-0000-000000000859" as UserId })
		const layer = makePolicyLayer(
			{ [MEMBER_ID]: { userId: TARGET_USER_ID, organizationId: TEST_ORG_ID, role: "member" } },
			{},
		)

		const result = await runWithActorEither(
			OrganizationMemberPolicy.canUpdate(MEMBER_ID),
			layer,
			outsider,
		)
		expect(Either.isLeft(result)).toBe(true)
	})

	it("canDelete allows self-removal", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer(
			{ [MEMBER_ID]: { userId: actor.id, organizationId: TEST_ORG_ID, role: "member" } },
			{ [`${TEST_ORG_ID}:${actor.id}`]: "member" },
		)

		const result = await runWithActorEither(
			OrganizationMemberPolicy.canDelete(MEMBER_ID),
			layer,
			actor,
		)
		expect(Either.isRight(result)).toBe(true)
	})

	it("canDelete allows org admin", async () => {
		const admin = makeActor({ id: ADMIN_USER_ID })
		const layer = makePolicyLayer(
			{ [MEMBER_ID]: { userId: TARGET_USER_ID, organizationId: TEST_ORG_ID, role: "member" } },
			{ [`${TEST_ORG_ID}:${ADMIN_USER_ID}`]: "admin" },
		)

		const result = await runWithActorEither(
			OrganizationMemberPolicy.canDelete(MEMBER_ID),
			layer,
			admin,
		)
		expect(Either.isRight(result)).toBe(true)
	})

	it("canDelete denies org owner (only admin allowed)", async () => {
		const owner = makeActor({ id: OWNER_USER_ID })
		const layer = makePolicyLayer(
			{ [MEMBER_ID]: { userId: TARGET_USER_ID, organizationId: TEST_ORG_ID, role: "member" } },
			{ [`${TEST_ORG_ID}:${OWNER_USER_ID}`]: "owner" },
		)

		const result = await runWithActorEither(
			OrganizationMemberPolicy.canDelete(MEMBER_ID),
			layer,
			owner,
		)
		expect(Either.isLeft(result)).toBe(true)
		if (Either.isLeft(result)) {
			expect(UnauthorizedError.is(result.left)).toBe(true)
		}
	})
})
