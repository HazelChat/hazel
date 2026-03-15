import { describe, expect, it } from "@effect/vitest"
import { ChannelMemberRepo, ChannelRepo, MessageRepo, OrganizationMemberRepo } from "@hazel/backend-core"
import { PermissionError } from "@hazel/domain"
import type { ChannelId, ChannelMemberId, MessageId, OrganizationId, UserId } from "@hazel/schema"
import { Effect, Either, Layer, Option } from "effect"
import { OrgResolver } from "./org-resolver"
import { makeActor, TEST_ORG_ID } from "../policies/policy-test-helpers"
import { CurrentUser } from "@hazel/domain"

type Role = "admin" | "member" | "owner"

const CHANNEL_ID = "00000000-0000-0000-0000-000000000501" as ChannelId
const MESSAGE_ID = "00000000-0000-0000-0000-000000000601" as MessageId
const CHANNEL_MEMBER_ID = "00000000-0000-0000-0000-000000000701" as ChannelMemberId

const makeOrgMemberRepoLayer = (members: Record<string, Role>) =>
	Layer.succeed(OrganizationMemberRepo, {
		findByOrgAndUser: (organizationId: OrganizationId, userId: UserId) => {
			const role = members[`${organizationId}:${userId}`]
			return Effect.succeed(role ? Option.some({ organizationId, userId, role }) : Option.none())
		},
	} as unknown as OrganizationMemberRepo)

const makeChannelRepoLayer = (
	channels: Record<
		string,
		{ organizationId: OrganizationId; type: string; parentChannelId?: string | null; id: string }
	>,
) =>
	Layer.succeed(ChannelRepo, {
		findById: (id: ChannelId) => {
			const channel = channels[id]
			return Effect.succeed(channel ? Option.some(channel) : Option.none())
		},
	} as unknown as ChannelRepo)

const makeChannelMemberRepoLayer = (memberships: Record<string, boolean>) =>
	Layer.succeed(ChannelMemberRepo, {
		findByChannelAndUser: (channelId: ChannelId, userId: UserId) => {
			const key = `${channelId}:${userId}`
			return Effect.succeed(
				memberships[key] ? Option.some({ id: CHANNEL_MEMBER_ID, channelId, userId }) : Option.none(),
			)
		},
	} as unknown as ChannelMemberRepo)

const makeMessageRepoLayer = (messages: Record<string, { channelId: ChannelId }>) =>
	Layer.succeed(MessageRepo, {
		findById: (id: MessageId) => {
			const message = messages[id]
			return Effect.succeed(message ? Option.some(message) : Option.none())
		},
	} as unknown as MessageRepo)

const makeResolverLayer = (opts: {
	members?: Record<string, Role>
	channels?: Record<
		string,
		{ organizationId: OrganizationId; type: string; parentChannelId?: string | null; id: string }
	>
	channelMembers?: Record<string, boolean>
	messages?: Record<string, { channelId: ChannelId }>
}) =>
	OrgResolver.DefaultWithoutDependencies.pipe(
		Layer.provide(makeOrgMemberRepoLayer(opts.members ?? {})),
		Layer.provide(makeChannelRepoLayer(opts.channels ?? {})),
		Layer.provide(makeChannelMemberRepoLayer(opts.channelMembers ?? {})),
		Layer.provide(makeMessageRepoLayer(opts.messages ?? {})),
	)

const runEither = <A, E>(
	make: Effect.Effect<A, E, OrgResolver | CurrentUser.Context>,
	layer: Layer.Layer<OrgResolver, any, never>,
	actor: CurrentUser.Schema = makeActor(),
) =>
	Effect.runPromise(
		effect.pipe(Effect.provide(layer), Effect.provideService(CurrentUser.Context, actor), Effect.either),
	)

const use = (fn: (resolver: OrgResolver) => Effect.Effect<any, any, any>) =>
	Effect.gen(function* () {
		const resolver = yield* OrgResolver
		return yield* fn(resolver)
	})

describe("OrgResolver", () => {
	describe("requireScope", () => {
		it("grants access for org members", async () => {
			const actor = makeActor()
			const layer = makeResolverLayer({
				members: { [`${TEST_ORG_ID}:${actor.id}`]: "member" },
			})

			const result = await runEither(
				use((r) => r.requireScope(TEST_ORG_ID, "organizations:read", "Organization", "read")),
				layer,
				actor,
			)
			expect(Either.isRight(result)).toBe(true)
		})

		it("denies access for non-members", async () => {
			const actor = makeActor()
			const layer = makeResolverLayer({ members: {} })

			const result = await runEither(
				use((r) => r.requireScope(TEST_ORG_ID, "organizations:read", "Organization", "read")),
				layer,
				actor,
			)
			expect(Either.isLeft(result)).toBe(true)
			if (Either.isLeft(result)) {
				expect(PermissionError.is(result.left)).toBe(true)
			}
		})
	})

	describe("requireAdminOrOwner", () => {
		it("grants access for admin", async () => {
			const actor = makeActor()
			const layer = makeResolverLayer({
				members: { [`${TEST_ORG_ID}:${actor.id}`]: "admin" },
			})

			const result = await runEither(
				use((r) =>
					r.requireAdminOrOwner(TEST_ORG_ID, "organizations:write", "Organization", "update"),
				),
				layer,
				actor,
			)
			expect(Either.isRight(result)).toBe(true)
		})

		it("grants access for owner", async () => {
			const actor = makeActor()
			const layer = makeResolverLayer({
				members: { [`${TEST_ORG_ID}:${actor.id}`]: "owner" },
			})

			const result = await runEither(
				use((r) =>
					r.requireAdminOrOwner(TEST_ORG_ID, "organizations:write", "Organization", "update"),
				),
				layer,
				actor,
			)
			expect(Either.isRight(result)).toBe(true)
		})

		it("denies access for regular member", async () => {
			const actor = makeActor()
			const layer = makeResolverLayer({
				members: { [`${TEST_ORG_ID}:${actor.id}`]: "member" },
			})

			const result = await runEither(
				use((r) =>
					r.requireAdminOrOwner(TEST_ORG_ID, "organizations:write", "Organization", "update"),
				),
				layer,
				actor,
			)
			expect(Either.isLeft(result)).toBe(true)
			if (Either.isLeft(result)) {
				expect(PermissionError.is(result.left)).toBe(true)
			}
		})
	})

	describe("requireOwner", () => {
		it("grants access for owner only", async () => {
			const actor = makeActor()
			const adminActor = makeActor({ id: "00000000-0000-0000-0000-000000000502" as UserId })

			const layer = makeResolverLayer({
				members: {
					[`${TEST_ORG_ID}:${actor.id}`]: "owner",
					[`${TEST_ORG_ID}:${adminActor.id}`]: "admin",
				},
			})

			const ownerResult = await runEither(
				use((r) => r.requireOwner(TEST_ORG_ID, "organizations:write", "Organization", "delete")),
				layer,
				actor,
			)
			const adminResult = await runEither(
				use((r) => r.requireOwner(TEST_ORG_ID, "organizations:write", "Organization", "delete")),
				layer,
				adminActor,
			)

			expect(Either.isRight(ownerResult)).toBe(true)
			expect(Either.isLeft(adminResult)).toBe(true)
		})
	})

	describe("fromChannel", () => {
		it("resolves channel org and checks scope", async () => {
			const actor = makeActor()
			const layer = makeResolverLayer({
				members: { [`${TEST_ORG_ID}:${actor.id}`]: "member" },
				channels: {
					[CHANNEL_ID]: {
						organizationId: TEST_ORG_ID,
						type: "public",
						id: CHANNEL_ID,
					},
				},
			})

			const result = await runEither(
				use((r) => r.fromChannel(CHANNEL_ID, "channels:read", "Channel", "read")),
				layer,
				actor,
			)
			expect(Either.isRight(result)).toBe(true)
		})

		it("fails for missing channel", async () => {
			const actor = makeActor()
			const layer = makeResolverLayer({
				members: { [`${TEST_ORG_ID}:${actor.id}`]: "member" },
			})

			const missingChannelId = "00000000-0000-0000-0000-000000000599" as ChannelId
			const result = await runEither(
				use((r) => r.fromChannel(missingChannelId, "channels:read", "Channel", "read")),
				layer,
				actor,
			)
			expect(Either.isLeft(result)).toBe(true)
		})
	})

	describe("fromChannelWithAccess", () => {
		it("allows public channel access for any org member", async () => {
			const actor = makeActor()
			const layer = makeResolverLayer({
				members: { [`${TEST_ORG_ID}:${actor.id}`]: "member" },
				channels: {
					[CHANNEL_ID]: {
						organizationId: TEST_ORG_ID,
						type: "public",
						id: CHANNEL_ID,
					},
				},
			})

			const result = await runEither(
				use((r) => r.fromChannelWithAccess(CHANNEL_ID, "messages:read", "Message", "read")),
				layer,
				actor,
			)
			expect(Either.isRight(result)).toBe(true)
		})

		it("allows private channel for admin without membership", async () => {
			const actor = makeActor()
			const layer = makeResolverLayer({
				members: { [`${TEST_ORG_ID}:${actor.id}`]: "admin" },
				channels: {
					[CHANNEL_ID]: {
						organizationId: TEST_ORG_ID,
						type: "private",
						id: CHANNEL_ID,
					},
				},
			})

			const result = await runEither(
				use((r) => r.fromChannelWithAccess(CHANNEL_ID, "messages:read", "Message", "read")),
				layer,
				actor,
			)
			expect(Either.isRight(result)).toBe(true)
		})

		it("denies private channel for non-admin without channel membership", async () => {
			const actor = makeActor()
			const layer = makeResolverLayer({
				members: { [`${TEST_ORG_ID}:${actor.id}`]: "member" },
				channels: {
					[CHANNEL_ID]: {
						organizationId: TEST_ORG_ID,
						type: "private",
						id: CHANNEL_ID,
					},
				},
				channelMembers: {},
			})

			const result = await runEither(
				use((r) => r.fromChannelWithAccess(CHANNEL_ID, "messages:read", "Message", "read")),
				layer,
				actor,
			)
			expect(Either.isLeft(result)).toBe(true)
		})

		it("allows private channel for member with channel membership", async () => {
			const actor = makeActor()
			const layer = makeResolverLayer({
				members: { [`${TEST_ORG_ID}:${actor.id}`]: "member" },
				channels: {
					[CHANNEL_ID]: {
						organizationId: TEST_ORG_ID,
						type: "private",
						id: CHANNEL_ID,
					},
				},
				channelMembers: { [`${CHANNEL_ID}:${actor.id}`]: true },
			})

			const result = await runEither(
				use((r) => r.fromChannelWithAccess(CHANNEL_ID, "messages:read", "Message", "read")),
				layer,
				actor,
			)
			expect(Either.isRight(result)).toBe(true)
		})

		it("allows direct channel only for channel members", async () => {
			const actor = makeActor()
			const outsider = makeActor({ id: "00000000-0000-0000-0000-000000000503" as UserId })

			const layer = makeResolverLayer({
				members: {
					[`${TEST_ORG_ID}:${actor.id}`]: "member",
					[`${TEST_ORG_ID}:${outsider.id}`]: "admin",
				},
				channels: {
					[CHANNEL_ID]: {
						organizationId: TEST_ORG_ID,
						type: "direct",
						id: CHANNEL_ID,
					},
				},
				channelMembers: { [`${CHANNEL_ID}:${actor.id}`]: true },
			})

			const memberResult = await runEither(
				use((r) => r.fromChannelWithAccess(CHANNEL_ID, "messages:read", "Message", "read")),
				layer,
				actor,
			)
			const outsiderResult = await runEither(
				use((r) => r.fromChannelWithAccess(CHANNEL_ID, "messages:read", "Message", "read")),
				layer,
				outsider,
			)

			expect(Either.isRight(memberResult)).toBe(true)
			expect(Either.isLeft(outsiderResult)).toBe(true)
		})

		it("checks parent channel access for threads", async () => {
			const actor = makeActor()
			const parentChannelId = "00000000-0000-0000-0000-000000000502" as ChannelId
			const threadId = "00000000-0000-0000-0000-000000000503" as ChannelId

			const layer = makeResolverLayer({
				members: { [`${TEST_ORG_ID}:${actor.id}`]: "member" },
				channels: {
					[threadId]: {
						organizationId: TEST_ORG_ID,
						type: "thread",
						parentChannelId,
						id: threadId,
					},
					[parentChannelId]: {
						organizationId: TEST_ORG_ID,
						type: "public",
						id: parentChannelId,
					},
				},
			})

			const result = await runEither(
				use((r) => r.fromChannelWithAccess(threadId, "messages:read", "Message", "read")),
				layer,
				actor,
			)
			expect(Either.isRight(result)).toBe(true)
		})
	})

	describe("fromMessage", () => {
		it("resolves message -> channel -> org chain", async () => {
			const actor = makeActor()
			const layer = makeResolverLayer({
				members: { [`${TEST_ORG_ID}:${actor.id}`]: "member" },
				channels: {
					[CHANNEL_ID]: {
						organizationId: TEST_ORG_ID,
						type: "public",
						id: CHANNEL_ID,
					},
				},
				messages: {
					[MESSAGE_ID]: { channelId: CHANNEL_ID },
				},
			})

			const result = await runEither(
				use((r) => r.fromMessage(MESSAGE_ID, "messages:read", "Message", "read")),
				layer,
				actor,
			)
			expect(Either.isRight(result)).toBe(true)
		})

		it("fails for missing message", async () => {
			const actor = makeActor()
			const layer = makeResolverLayer({
				members: { [`${TEST_ORG_ID}:${actor.id}`]: "member" },
			})

			const missingId = "00000000-0000-0000-0000-000000000699" as MessageId
			const result = await runEither(
				use((r) => r.fromMessage(missingId, "messages:read", "Message", "read")),
				layer,
				actor,
			)
			expect(Either.isLeft(result)).toBe(true)
		})
	})
})
