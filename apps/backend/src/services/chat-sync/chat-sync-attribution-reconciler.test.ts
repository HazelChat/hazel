import { describe, expect, it } from "@effect/vitest"
import { MessageRepo, OrganizationMemberRepo, UserRepo } from "@hazel/backend-core"
import type { OrganizationId, UserId } from "@hazel/schema"
import { Effect, Layer, ServiceMap } from "effect"
import { ChatSyncAttributionReconciler } from "./chat-sync-attribution-reconciler.ts"
import { serviceShape } from "../../test/effect-helpers"

const ORGANIZATION_ID = "00000000-0000-4000-8000-000000000001" as OrganizationId
const USER_ID = "00000000-0000-4000-8000-000000000002" as UserId
const SHADOW_USER_ID = "00000000-0000-4000-8000-000000000003" as UserId

const makeLayer = (deps: {
	messageRepo: ServiceMap.Service.Shape<typeof MessageRepo>
	userRepo: ServiceMap.Service.Shape<typeof UserRepo>
	organizationMemberRepo: ServiceMap.Service.Shape<typeof OrganizationMemberRepo>
}) =>
	Layer.effect(ChatSyncAttributionReconciler, ChatSyncAttributionReconciler.make).pipe(
		Layer.provide(Layer.succeed(MessageRepo, deps.messageRepo)),
		Layer.provide(Layer.succeed(UserRepo, deps.userRepo)),
		Layer.provide(Layer.succeed(OrganizationMemberRepo, deps.organizationMemberRepo)),
	)

describe("ChatSyncAttributionReconciler", () => {
	it("relinks historical provider messages from shadow user to linked user", async () => {
		let reassignParams: unknown = null

		const layer = makeLayer({
			messageRepo: serviceShape<typeof MessageRepo>({
				reassignExternalSyncedAuthors: (params: unknown) => {
					reassignParams = params
					return Effect.succeed(4)
				},
			}),
			userRepo: serviceShape<typeof UserRepo>({
				upsertByExternalId: () => Effect.succeed({ id: SHADOW_USER_ID }),
			}),
			organizationMemberRepo: serviceShape<typeof OrganizationMemberRepo>({
				upsertByOrgAndUser: () => Effect.succeed({}),
			}),
		})

		const result = await Effect.runPromise(
			ChatSyncAttributionReconciler.use((service) =>
				service.relinkHistoricalProviderMessages({
					organizationId: ORGANIZATION_ID,
					provider: "discord",
					userId: USER_ID,
					externalAccountId: "123",
					externalAccountName: "Maki",
				}),
			).pipe(Effect.provide(layer)),
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
			messageRepo: serviceShape<typeof MessageRepo>({
				reassignExternalSyncedAuthors: (params: unknown) => {
					reassignParams = params
					return Effect.succeed(2)
				},
			}),
			userRepo: serviceShape<typeof UserRepo>({
				upsertByExternalId: () => Effect.succeed({ id: SHADOW_USER_ID }),
			}),
			organizationMemberRepo: serviceShape<typeof OrganizationMemberRepo>({
				upsertByOrgAndUser: () => Effect.succeed({}),
			}),
		})

		const result = await Effect.runPromise(
			ChatSyncAttributionReconciler.use((service) =>
				service.unlinkHistoricalProviderMessages({
					organizationId: ORGANIZATION_ID,
					provider: "discord",
					userId: USER_ID,
					externalAccountId: "123",
					externalAccountName: "Maki",
				}),
			).pipe(Effect.provide(layer)),
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
