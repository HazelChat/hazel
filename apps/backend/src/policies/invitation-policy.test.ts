import { describe, expect, it } from "@effect/vitest"
import { InvitationRepo, UserRepo } from "@hazel/backend-core"
import { UnauthorizedError } from "@hazel/domain"
import type { InvitationId, OrganizationId, UserId } from "@hazel/schema"
import { Effect, Result, Layer, Option, ServiceMap } from "effect"
import { InvitationPolicy } from "./invitation-policy.ts"
import {
	makeActor,
	makeEntityNotFound,
	makeOrganizationMemberRepoLayer,
	makeOrgResolverLayer,
	runWithActorEither,
	serviceShape,
	TEST_ORG_ID,
	TEST_USER_ID,
} from "./policy-test-helpers.ts"

type Role = "admin" | "member" | "owner"

const INVITATION_ID = "00000000-0000-4000-8000-000000000821" as InvitationId
const MISSING_INVITATION_ID = "00000000-0000-4000-8000-000000000829" as InvitationId
const ADMIN_USER_ID = "00000000-0000-4000-8000-000000000822" as UserId

const makeInvitationRepoLayer = (
	invitations: Record<string, { invitedBy: UserId; organizationId: OrganizationId; email: string }>,
) =>
	Layer.succeed(InvitationRepo, {
		with: <A, E, R>(
			id: InvitationId,
			f: (inv: {
				invitedBy: UserId
				organizationId: OrganizationId
				email: string
			}) => Effect.Effect<A, E, R>,
		) => {
			const invitation = invitations[id]
			if (!invitation) {
				return Effect.fail(makeEntityNotFound("Invitation"))
			}
			return f(invitation)
		},
	} as ServiceMap.Service.Shape<typeof InvitationRepo>)

const makeUserRepoLayer = (users: Record<string, { email: string }>) =>
	Layer.succeed(
		UserRepo,
		serviceShape<typeof UserRepo>({
			findById: (id: UserId) => {
				const user = users[id]
				return Effect.succeed(user ? Option.some(user) : Option.none())
			},
		}),
	)

const makePolicyLayer = (
	members: Record<string, Role>,
	invitations: Record<string, { invitedBy: UserId; organizationId: OrganizationId; email: string }>,
	users: Record<string, { email: string }> = {},
) =>
	Layer.effect(InvitationPolicy, InvitationPolicy.make).pipe(
		Layer.provide(makeOrgResolverLayer(members)),
		Layer.provide(makeOrganizationMemberRepoLayer(members)),
		Layer.provide(makeInvitationRepoLayer(invitations)),
		Layer.provide(makeUserRepoLayer(users)),
	)

describe("InvitationPolicy", () => {
	it("canRead allows any authenticated user", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer({}, {})

		const result = await runWithActorEither(
			InvitationPolicy.use((policy) => policy.canRead(INVITATION_ID)),
			layer,
			actor,
		)

		expect(Result.isSuccess(result)).toBe(true)
	})

	it("canCreate allows admin-or-owner", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer(
			{
				[`${TEST_ORG_ID}:${actor.id}`]: "admin",
			},
			{},
		)

		const result = await runWithActorEither(
			InvitationPolicy.use((policy) => policy.canCreate(TEST_ORG_ID)),
			layer,
			actor,
		)

		expect(Result.isSuccess(result)).toBe(true)
	})

	it("canCreate denies regular member", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer(
			{
				[`${TEST_ORG_ID}:${actor.id}`]: "member",
			},
			{},
		)

		const result = await runWithActorEither(
			InvitationPolicy.use((policy) => policy.canCreate(TEST_ORG_ID)),
			layer,
			actor,
		)

		expect(Result.isFailure(result)).toBe(true)
	})

	it("canUpdate allows creator", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer(
			{},
			{
				[INVITATION_ID]: {
					invitedBy: actor.id,
					organizationId: TEST_ORG_ID,
					email: "invited@example.com",
				},
			},
		)

		const result = await runWithActorEither(
			InvitationPolicy.use((policy) => policy.canUpdate(INVITATION_ID)),
			layer,
			actor,
		)

		expect(Result.isSuccess(result)).toBe(true)
	})

	it("canUpdate allows org admin who is not creator", async () => {
		const admin = makeActor({ id: ADMIN_USER_ID })
		const layer = makePolicyLayer(
			{
				[`${TEST_ORG_ID}:${ADMIN_USER_ID}`]: "admin",
			},
			{
				[INVITATION_ID]: {
					invitedBy: TEST_USER_ID,
					organizationId: TEST_ORG_ID,
					email: "invited@example.com",
				},
			},
		)

		const result = await runWithActorEither(
			InvitationPolicy.use((policy) => policy.canUpdate(INVITATION_ID)),
			layer,
			admin,
		)

		expect(Result.isSuccess(result)).toBe(true)
	})

	it("canUpdate denies non-creator non-admin", async () => {
		const outsider = makeActor({ id: ADMIN_USER_ID })
		const layer = makePolicyLayer(
			{
				[`${TEST_ORG_ID}:${ADMIN_USER_ID}`]: "member",
			},
			{
				[INVITATION_ID]: {
					invitedBy: TEST_USER_ID,
					organizationId: TEST_ORG_ID,
					email: "invited@example.com",
				},
			},
		)

		const result = await runWithActorEither(
			InvitationPolicy.use((policy) => policy.canUpdate(INVITATION_ID)),
			layer,
			outsider,
		)

		expect(Result.isFailure(result)).toBe(true)
	})

	it("canDelete allows creator", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer(
			{},
			{
				[INVITATION_ID]: {
					invitedBy: actor.id,
					organizationId: TEST_ORG_ID,
					email: "invited@example.com",
				},
			},
		)

		const result = await runWithActorEither(
			InvitationPolicy.use((policy) => policy.canDelete(INVITATION_ID)),
			layer,
			actor,
		)

		expect(Result.isSuccess(result)).toBe(true)
	})

	it("canDelete allows org admin who is not creator", async () => {
		const admin = makeActor({ id: ADMIN_USER_ID })
		const layer = makePolicyLayer(
			{
				[`${TEST_ORG_ID}:${ADMIN_USER_ID}`]: "admin",
			},
			{
				[INVITATION_ID]: {
					invitedBy: TEST_USER_ID,
					organizationId: TEST_ORG_ID,
					email: "invited@example.com",
				},
			},
		)

		const result = await runWithActorEither(
			InvitationPolicy.use((policy) => policy.canDelete(INVITATION_ID)),
			layer,
			admin,
		)

		expect(Result.isSuccess(result)).toBe(true)
	})

	it("canAccept allows when user email matches invitation email", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer(
			{},
			{
				[INVITATION_ID]: {
					invitedBy: ADMIN_USER_ID,
					organizationId: TEST_ORG_ID,
					email: "policy-test@example.com",
				},
			},
			{
				[actor.id]: { email: "policy-test@example.com" },
			},
		)

		const result = await runWithActorEither(
			InvitationPolicy.use((policy) => policy.canAccept(INVITATION_ID)),
			layer,
			actor,
		)

		expect(Result.isSuccess(result)).toBe(true)
	})

	it("canAccept denies when user email does not match", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer(
			{},
			{
				[INVITATION_ID]: {
					invitedBy: ADMIN_USER_ID,
					organizationId: TEST_ORG_ID,
					email: "different@example.com",
				},
			},
			{
				[actor.id]: { email: "policy-test@example.com" },
			},
		)

		const result = await runWithActorEither(
			InvitationPolicy.use((policy) => policy.canAccept(INVITATION_ID)),
			layer,
			actor,
		)

		expect(Result.isFailure(result)).toBe(true)
	})

	it("canAccept denies when user is not found", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer(
			{},
			{
				[INVITATION_ID]: {
					invitedBy: ADMIN_USER_ID,
					organizationId: TEST_ORG_ID,
					email: "policy-test@example.com",
				},
			},
			{},
		)

		const result = await runWithActorEither(
			InvitationPolicy.use((policy) => policy.canAccept(INVITATION_ID)),
			layer,
			actor,
		)

		expect(Result.isFailure(result)).toBe(true)
	})

	it("canList allows admin-or-owner", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer(
			{
				[`${TEST_ORG_ID}:${actor.id}`]: "admin",
			},
			{},
		)

		const result = await runWithActorEither(
			InvitationPolicy.use((policy) => policy.canList(TEST_ORG_ID)),
			layer,
			actor,
		)

		expect(Result.isSuccess(result)).toBe(true)
	})

	it("canList denies regular member", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer(
			{
				[`${TEST_ORG_ID}:${actor.id}`]: "member",
			},
			{},
		)

		const result = await runWithActorEither(
			InvitationPolicy.use((policy) => policy.canList(TEST_ORG_ID)),
			layer,
			actor,
		)

		expect(Result.isFailure(result)).toBe(true)
	})
})
