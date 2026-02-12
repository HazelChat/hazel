import { describe, expect, it } from "@effect/vitest"
import { MessageRepo, OrganizationMemberRepo, UserRepo } from "@hazel/backend-core"
import type { OrganizationId, UserId } from "@hazel/schema"
import { Effect, Layer } from "effect"
import { ChatSyncAttributionReconciler } from "./chat-sync-attribution-reconciler.ts"

const ORGANIZATION_ID = "00000000-0000-0000-0000-000000000001" as OrganizationId
const USER_ID = "00000000-0000-0000-0000-000000000002" as UserId
const SHADOW_USER_ID = "00000000-0000-0000-0000-000000000003" as UserId

const makeLayer = (deps: {
	messageRepo: MessageRepo
	userRepo: UserRepo
	organizationMemberRepo: OrganizationMemberRepo
}) =>
	ChatSyncAttributionReconciler.DefaultWithoutDependencies.pipe(
		Layer.provide(Layer.succeed(MessageRepo, deps.messageRepo)),
		Layer.provide(Layer.succeed(UserRepo, deps.userRepo)),
		Layer.provide(Layer.succeed(OrganizationMemberRepo, deps.organizationMemberRepo)),
	)

describe("ChatSyncAttributionReconciler", () => {
	it("relinks historical provider messages from shadow user to linked user", async () => {
		let reassignParams: unknown = null

		const layer = makeLayer({
			messageRepo: {
				reassignExternalSyncedAuthors: (params: unknown) => {
					reassignParams = params
					return Effect.succeed(4)
				},
			} as unknown as MessageRepo,
			userRepo: {
				upsertByExternalId: () => Effect.succeed({ id: SHADOW_USER_ID }),
			} as unknown as UserRepo,
			organizationMemberRepo: {
				upsertByOrgAndUser: () => Effect.succeed({}),
			} as unknown as OrganizationMemberRepo,
		})

		const result = await Effect.runPromise(
			ChatSyncAttributionReconciler.relinkHistoricalProviderMessages({
				organizationId: ORGANIZATION_ID,
				provider: "discord",
				userId: USER_ID,
				externalAccountId: "123",
				externalAccountName: "Maki",
			}).pipe(Effect.provide(layer)),
		)

		expect(result.updatedCount).toBe(4)
		expect(reassignParams).toEqual({
			organizationId: ORGANIZATION_ID,
			provider: "discord",
			fromAuthorId: SHADOW_USER_ID,
			toAuthorId: USER_ID,
		})
	})

	it("unlinks historical provider messages from linked user to shadow user", async () => {
		let reassignParams: unknown = null

		const layer = makeLayer({
			messageRepo: {
				reassignExternalSyncedAuthors: (params: unknown) => {
					reassignParams = params
					return Effect.succeed(2)
				},
			} as unknown as MessageRepo,
			userRepo: {
				upsertByExternalId: () => Effect.succeed({ id: SHADOW_USER_ID }),
			} as unknown as UserRepo,
			organizationMemberRepo: {
				upsertByOrgAndUser: () => Effect.succeed({}),
			} as unknown as OrganizationMemberRepo,
		})

		const result = await Effect.runPromise(
			ChatSyncAttributionReconciler.unlinkHistoricalProviderMessages({
				organizationId: ORGANIZATION_ID,
				provider: "discord",
				userId: USER_ID,
				externalAccountId: "123",
				externalAccountName: "Maki",
			}).pipe(Effect.provide(layer)),
		)

		expect(result.updatedCount).toBe(2)
		expect(reassignParams).toEqual({
			organizationId: ORGANIZATION_ID,
			provider: "discord",
			fromAuthorId: USER_ID,
			toAuthorId: SHADOW_USER_ID,
		})
	})
})
