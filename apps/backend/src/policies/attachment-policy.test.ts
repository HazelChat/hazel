import { describe, expect, it } from "@effect/vitest"
import { AttachmentRepo, ChannelMemberRepo, ChannelRepo, MessageRepo } from "@hazel/backend-core"
import type { AttachmentId, ChannelId, MessageId, OrganizationId, UserId } from "@hazel/schema"
import { Effect, Either, Layer, Option } from "effect"
import { AttachmentPolicy } from "./attachment-policy.ts"
import {
	makeActor,
	makeEntityNotFound,
	makeOrganizationMemberRepoLayer,
	makeOrgResolverLayer,
	runWithActorEither,
	TEST_ORG_ID,
	TEST_USER_ID,
} from "./policy-test-helpers.ts"

type Role = "admin" | "member" | "owner"

const ATTACHMENT_ID = "00000000-0000-0000-0000-000000000831" as AttachmentId
const MESSAGE_ID = "00000000-0000-0000-0000-000000000832" as MessageId
const CHANNEL_ID = "00000000-0000-0000-0000-000000000833" as ChannelId
const OTHER_USER_ID = "00000000-0000-0000-0000-000000000834" as UserId
const ADMIN_USER_ID = "00000000-0000-0000-0000-000000000835" as UserId
const MESSAGE_AUTHOR_ID = "00000000-0000-0000-0000-000000000836" as UserId

const makeAttachmentRepoLayer = (
	attachments: Record<string, { uploadedBy: UserId; messageId: MessageId | null }>,
) =>
	Layer.succeed(AttachmentRepo, {
		with: <A, E, R>(
			id: AttachmentId,
			f: (attachment: { uploadedBy: UserId; messageId: MessageId | null }) => Effect.Effect<A, E, R>,
		) => {
			const attachment = attachments[id]
			if (!attachment) {
				return Effect.fail(makeEntityNotFound("Attachment"))
			}
			return f(attachment)
		},
	} as unknown as AttachmentRepo)

const makeMessageRepoLayer = (
	messages: Record<string, { authorId: UserId; channelId: ChannelId }>,
) =>
	Layer.succeed(MessageRepo, {
		with: <A, E, R>(
			id: MessageId,
			f: (message: { authorId: UserId; channelId: ChannelId }) => Effect.Effect<A, E, R>,
		) => {
			const message = messages[id]
			if (!message) {
				return Effect.fail(makeEntityNotFound("Message"))
			}
			return f(message)
		},
	} as unknown as MessageRepo)

const makeChannelRepoLayer = (
	channels: Record<string, { organizationId: OrganizationId; type: string; id: ChannelId }>,
) =>
	Layer.succeed(ChannelRepo, {
		with: <A, E, R>(
			id: ChannelId,
			f: (channel: { organizationId: OrganizationId; type: string; id: ChannelId }) => Effect.Effect<A, E, R>,
		) => {
			const channel = channels[id]
			if (!channel) {
				return Effect.fail(makeEntityNotFound("Channel"))
			}
			return f(channel)
		},
	} as unknown as ChannelRepo)

const makeChannelMemberRepoLayer = (memberships: Record<string, boolean>) =>
	Layer.succeed(ChannelMemberRepo, {
		findByChannelAndUser: (channelId: ChannelId, userId: UserId) => {
			const key = `${channelId}:${userId}`
			return Effect.succeed(memberships[key] ? Option.some({ channelId, userId }) : Option.none())
		},
	} as unknown as ChannelMemberRepo)

const makePolicyLayer = (opts: {
	members?: Record<string, Role>
	attachments?: Record<string, { uploadedBy: UserId; messageId: MessageId | null }>
	messages?: Record<string, { authorId: UserId; channelId: ChannelId }>
	channels?: Record<string, { organizationId: OrganizationId; type: string; id: ChannelId }>
	channelMemberships?: Record<string, boolean>
}) =>
	AttachmentPolicy.DefaultWithoutDependencies.pipe(
		Layer.provide(makeAttachmentRepoLayer(opts.attachments ?? {})),
		Layer.provide(makeMessageRepoLayer(opts.messages ?? {})),
		Layer.provide(makeChannelRepoLayer(opts.channels ?? {})),
		Layer.provide(makeChannelMemberRepoLayer(opts.channelMemberships ?? {})),
		Layer.provide(makeOrganizationMemberRepoLayer(opts.members ?? {})),
		Layer.provide(makeOrgResolverLayer(opts.members ?? {})),
	)

describe("AttachmentPolicy", () => {
	it("canCreate allows any user", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer({})

		const result = await runWithActorEither(AttachmentPolicy.canCreate(), layer, actor)
		expect(Either.isRight(result)).toBe(true)
	})

	it("canUpdate allows uploader", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer({
			attachments: {
				[ATTACHMENT_ID]: { uploadedBy: TEST_USER_ID, messageId: null },
			},
		})

		const result = await runWithActorEither(AttachmentPolicy.canUpdate(ATTACHMENT_ID), layer, actor)
		expect(Either.isRight(result)).toBe(true)
	})

	it("canUpdate denies non-uploader", async () => {
		const actor = makeActor({ id: OTHER_USER_ID })
		const layer = makePolicyLayer({
			attachments: {
				[ATTACHMENT_ID]: { uploadedBy: TEST_USER_ID, messageId: null },
			},
		})

		const result = await runWithActorEither(AttachmentPolicy.canUpdate(ATTACHMENT_ID), layer, actor)
		expect(Either.isLeft(result)).toBe(true)
	})

	it("canDelete without messageId allows uploader", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer({
			attachments: {
				[ATTACHMENT_ID]: { uploadedBy: TEST_USER_ID, messageId: null },
			},
		})

		const result = await runWithActorEither(AttachmentPolicy.canDelete(ATTACHMENT_ID), layer, actor)
		expect(Either.isRight(result)).toBe(true)
	})

	it("canDelete without messageId denies other user", async () => {
		const actor = makeActor({ id: OTHER_USER_ID })
		const layer = makePolicyLayer({
			attachments: {
				[ATTACHMENT_ID]: { uploadedBy: TEST_USER_ID, messageId: null },
			},
		})

		const result = await runWithActorEither(AttachmentPolicy.canDelete(ATTACHMENT_ID), layer, actor)
		expect(Either.isLeft(result)).toBe(true)
	})

	it("canDelete with messageId allows uploader", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer({
			attachments: {
				[ATTACHMENT_ID]: { uploadedBy: TEST_USER_ID, messageId: MESSAGE_ID },
			},
			messages: {
				[MESSAGE_ID]: { authorId: MESSAGE_AUTHOR_ID, channelId: CHANNEL_ID },
			},
			channels: {
				[CHANNEL_ID]: { organizationId: TEST_ORG_ID, type: "private", id: CHANNEL_ID },
			},
		})

		const result = await runWithActorEither(AttachmentPolicy.canDelete(ATTACHMENT_ID), layer, actor)
		expect(Either.isRight(result)).toBe(true)
	})

	it("canDelete with messageId allows message author", async () => {
		const actor = makeActor({ id: MESSAGE_AUTHOR_ID })
		const layer = makePolicyLayer({
			attachments: {
				[ATTACHMENT_ID]: { uploadedBy: OTHER_USER_ID, messageId: MESSAGE_ID },
			},
			messages: {
				[MESSAGE_ID]: { authorId: MESSAGE_AUTHOR_ID, channelId: CHANNEL_ID },
			},
			channels: {
				[CHANNEL_ID]: { organizationId: TEST_ORG_ID, type: "private", id: CHANNEL_ID },
			},
		})

		const result = await runWithActorEither(AttachmentPolicy.canDelete(ATTACHMENT_ID), layer, actor)
		expect(Either.isRight(result)).toBe(true)
	})

	it("canDelete with messageId allows org admin", async () => {
		const actor = makeActor({ id: ADMIN_USER_ID })
		const layer = makePolicyLayer({
			members: {
				[`${TEST_ORG_ID}:${ADMIN_USER_ID}`]: "admin",
			},
			attachments: {
				[ATTACHMENT_ID]: { uploadedBy: OTHER_USER_ID, messageId: MESSAGE_ID },
			},
			messages: {
				[MESSAGE_ID]: { authorId: MESSAGE_AUTHOR_ID, channelId: CHANNEL_ID },
			},
			channels: {
				[CHANNEL_ID]: { organizationId: TEST_ORG_ID, type: "private", id: CHANNEL_ID },
			},
		})

		const result = await runWithActorEither(AttachmentPolicy.canDelete(ATTACHMENT_ID), layer, actor)
		expect(Either.isRight(result)).toBe(true)
	})

	it("canDelete with messageId denies random user", async () => {
		const actor = makeActor({ id: OTHER_USER_ID })
		const layer = makePolicyLayer({
			members: {
				[`${TEST_ORG_ID}:${OTHER_USER_ID}`]: "member",
			},
			attachments: {
				[ATTACHMENT_ID]: { uploadedBy: TEST_USER_ID, messageId: MESSAGE_ID },
			},
			messages: {
				[MESSAGE_ID]: { authorId: MESSAGE_AUTHOR_ID, channelId: CHANNEL_ID },
			},
			channels: {
				[CHANNEL_ID]: { organizationId: TEST_ORG_ID, type: "private", id: CHANNEL_ID },
			},
		})

		const result = await runWithActorEither(AttachmentPolicy.canDelete(ATTACHMENT_ID), layer, actor)
		expect(Either.isLeft(result)).toBe(true)
	})

	it("canView without messageId allows uploader", async () => {
		const actor = makeActor()
		const layer = makePolicyLayer({
			attachments: {
				[ATTACHMENT_ID]: { uploadedBy: TEST_USER_ID, messageId: null },
			},
		})

		const result = await runWithActorEither(AttachmentPolicy.canView(ATTACHMENT_ID), layer, actor)
		expect(Either.isRight(result)).toBe(true)
	})

	it("canView without messageId denies other user", async () => {
		const actor = makeActor({ id: OTHER_USER_ID })
		const layer = makePolicyLayer({
			attachments: {
				[ATTACHMENT_ID]: { uploadedBy: TEST_USER_ID, messageId: null },
			},
		})

		const result = await runWithActorEither(AttachmentPolicy.canView(ATTACHMENT_ID), layer, actor)
		expect(Either.isLeft(result)).toBe(true)
	})

	it("canView with public channel allows org member", async () => {
		const actor = makeActor({ id: OTHER_USER_ID })
		const layer = makePolicyLayer({
			members: {
				[`${TEST_ORG_ID}:${OTHER_USER_ID}`]: "member",
			},
			attachments: {
				[ATTACHMENT_ID]: { uploadedBy: TEST_USER_ID, messageId: MESSAGE_ID },
			},
			messages: {
				[MESSAGE_ID]: { authorId: MESSAGE_AUTHOR_ID, channelId: CHANNEL_ID },
			},
			channels: {
				[CHANNEL_ID]: { organizationId: TEST_ORG_ID, type: "public", id: CHANNEL_ID },
			},
		})

		const result = await runWithActorEither(AttachmentPolicy.canView(ATTACHMENT_ID), layer, actor)
		expect(Either.isRight(result)).toBe(true)
	})

	it("canView with private channel allows admin", async () => {
		const actor = makeActor({ id: ADMIN_USER_ID })
		const layer = makePolicyLayer({
			members: {
				[`${TEST_ORG_ID}:${ADMIN_USER_ID}`]: "admin",
			},
			attachments: {
				[ATTACHMENT_ID]: { uploadedBy: TEST_USER_ID, messageId: MESSAGE_ID },
			},
			messages: {
				[MESSAGE_ID]: { authorId: MESSAGE_AUTHOR_ID, channelId: CHANNEL_ID },
			},
			channels: {
				[CHANNEL_ID]: { organizationId: TEST_ORG_ID, type: "private", id: CHANNEL_ID },
			},
		})

		const result = await runWithActorEither(AttachmentPolicy.canView(ATTACHMENT_ID), layer, actor)
		expect(Either.isRight(result)).toBe(true)
	})

	it("canView with private channel allows channel member", async () => {
		const actor = makeActor({ id: OTHER_USER_ID })
		const layer = makePolicyLayer({
			channelMemberships: {
				[`${CHANNEL_ID}:${OTHER_USER_ID}`]: true,
			},
			attachments: {
				[ATTACHMENT_ID]: { uploadedBy: TEST_USER_ID, messageId: MESSAGE_ID },
			},
			messages: {
				[MESSAGE_ID]: { authorId: MESSAGE_AUTHOR_ID, channelId: CHANNEL_ID },
			},
			channels: {
				[CHANNEL_ID]: { organizationId: TEST_ORG_ID, type: "private", id: CHANNEL_ID },
			},
		})

		const result = await runWithActorEither(AttachmentPolicy.canView(ATTACHMENT_ID), layer, actor)
		expect(Either.isRight(result)).toBe(true)
	})

	it("canView with private channel denies non-member non-admin", async () => {
		const actor = makeActor({ id: OTHER_USER_ID })
		const layer = makePolicyLayer({
			members: {
				[`${TEST_ORG_ID}:${OTHER_USER_ID}`]: "member",
			},
			attachments: {
				[ATTACHMENT_ID]: { uploadedBy: TEST_USER_ID, messageId: MESSAGE_ID },
			},
			messages: {
				[MESSAGE_ID]: { authorId: MESSAGE_AUTHOR_ID, channelId: CHANNEL_ID },
			},
			channels: {
				[CHANNEL_ID]: { organizationId: TEST_ORG_ID, type: "private", id: CHANNEL_ID },
			},
		})

		const result = await runWithActorEither(AttachmentPolicy.canView(ATTACHMENT_ID), layer, actor)
		expect(Either.isLeft(result)).toBe(true)
	})
})
