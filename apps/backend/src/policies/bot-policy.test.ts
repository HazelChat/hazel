import { describe, expect, it } from "@effect/vitest"
import { BotRepo, OrganizationMemberRepo } from "@hazel/backend-core"
import { UnauthorizedError } from "@hazel/domain"
import type { BotId, OrganizationId, UserId } from "@hazel/schema"
import { Effect, Either, Layer, Option } from "effect"
import { BotPolicy } from "./bot-policy.ts"
import {
	makeActor,
	makeEntityNotFound,
	runWithActorEither,
	TEST_ALT_ORG_ID,
	TEST_ORG_ID,
} from "./policy-test-helpers.ts"

type Role = "admin" | "member" | "owner"

const BOT_ID = "00000000-0000-0000-0000-000000000401" as BotId
const MISSING_BOT_ID = "00000000-0000-0000-0000-000000000499" as BotId

const makeOrganizationMemberRepoLayer = (members: Record<string, Role>) =>
	Layer.succeed(OrganizationMemberRepo, {
		findByOrgAndUser: (organizationId: OrganizationId, userId: UserId) => {
			const role = members[`${organizationId}:${userId}`]
			return Effect.succeed(role ? Option.some({ organizationId, userId, role }) : Option.none())
		},
	} as unknown as OrganizationMemberRepo)

const makeBotRepoLayer = (bots: Record<string, { createdBy: UserId }>) =>
	Layer.succeed(BotRepo, {
		with: <A, E, R>(id: BotId, f: (bot: { createdBy: UserId }) => Effect.Effect<A, E, R>) => {
			const bot = bots[id]
			if (!bot) {
				return Effect.fail(makeEntityNotFound("Bot"))
			}
			return f(bot)
		},
	} as unknown as BotRepo)

const makePolicyLayer = (members: Record<string, Role>, bots: Record<string, { createdBy: UserId }>) =>
	BotPolicy.DefaultWithoutDependencies.pipe(
		Layer.provide(makeOrganizationMemberRepoLayer(members)),
		Layer.provide(makeBotRepoLayer(bots)),
	)

describe("BotPolicy", () => {
	it("canCreate requires organization membership", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer(
			{
				[`${TEST_ORG_ID}:${actor.id}`]: "member",
			},
			{},
		)

		const allowed = await runWithActorEither(BotPolicy.canCreate(TEST_ORG_ID), layer, actor)
		const denied = await runWithActorEither(BotPolicy.canCreate(TEST_ALT_ORG_ID), layer, actor)

		expect(Either.isRight(allowed)).toBe(true)
		expect(Either.isLeft(denied)).toBe(true)
	})

	it("canRead allows creator or org admin", async () => {
		const creator = makeActor()
		const admin = makeActor({
			id: "00000000-0000-0000-0000-000000000402" as UserId,
		})
		const outsider = makeActor({
			id: "00000000-0000-0000-0000-000000000403" as UserId,
			organizationId: TEST_ORG_ID,
		})

		const layer = makePolicyLayer(
			{
				[`${TEST_ORG_ID}:${admin.id}`]: "admin",
				[`${TEST_ORG_ID}:${outsider.id}`]: "member",
			},
			{
				[BOT_ID]: { createdBy: creator.id },
			},
		)

		const creatorAllowed = await runWithActorEither(BotPolicy.canRead(BOT_ID), layer, creator)
		const adminAllowed = await runWithActorEither(
			BotPolicy.canRead(BOT_ID),
			layer,
			makeActor({ ...admin, organizationId: TEST_ORG_ID }),
		)
		const outsiderDenied = await runWithActorEither(BotPolicy.canRead(BOT_ID), layer, outsider)

		expect(Either.isRight(creatorAllowed)).toBe(true)
		expect(Either.isRight(adminAllowed)).toBe(true)
		expect(Either.isLeft(outsiderDenied)).toBe(true)
	})

	it("canUpdate/canDelete require creator and map missing bot to UnauthorizedError", async () => {
		const creator = makeActor()
		const otherUser = makeActor({
			id: "00000000-0000-0000-0000-000000000404" as UserId,
		})
		const layer = makePolicyLayer({}, { [BOT_ID]: { createdBy: creator.id } })

		const updateCreator = await runWithActorEither(BotPolicy.canUpdate(BOT_ID), layer, creator)
		const updateOther = await runWithActorEither(BotPolicy.canUpdate(BOT_ID), layer, otherUser)
		const deleteMissing = await runWithActorEither(BotPolicy.canDelete(MISSING_BOT_ID), layer, creator)

		expect(Either.isRight(updateCreator)).toBe(true)
		expect(Either.isLeft(updateOther)).toBe(true)
		expect(Either.isLeft(deleteMissing)).toBe(true)
		if (Either.isLeft(deleteMissing)) {
			expect(UnauthorizedError.is(deleteMissing.left)).toBe(true)
		}
	})

	it("canInstall and canUninstall require admin-or-owner", async () => {
		const admin = makeActor()
		const member = makeActor({
			id: "00000000-0000-0000-0000-000000000405" as UserId,
		})
		const layer = makePolicyLayer(
			{
				[`${TEST_ORG_ID}:${admin.id}`]: "admin",
				[`${TEST_ORG_ID}:${member.id}`]: "member",
			},
			{},
		)

		const installAdmin = await runWithActorEither(BotPolicy.canInstall(TEST_ORG_ID), layer, admin)
		const uninstallAdmin = await runWithActorEither(BotPolicy.canUninstall(TEST_ORG_ID), layer, admin)
		const installMember = await runWithActorEither(BotPolicy.canInstall(TEST_ORG_ID), layer, member)

		expect(Either.isRight(installAdmin)).toBe(true)
		expect(Either.isRight(uninstallAdmin)).toBe(true)
		expect(Either.isLeft(installMember)).toBe(true)
	})
})
