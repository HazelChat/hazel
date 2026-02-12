import { MessageRepo, OrganizationMemberRepo, UserRepo } from "@hazel/backend-core"
import { withSystemActor } from "@hazel/domain"
import type { OrganizationId, UserId } from "@hazel/schema"
import type { IntegrationConnection } from "@hazel/domain/models"
import { Effect } from "effect"

interface ReconcileAttributionParams {
	organizationId: OrganizationId
	provider: IntegrationConnection.IntegrationProvider
	userId: UserId
	externalAccountId: string
	externalAccountName?: string | null
}

const defaultShadowDisplayName = (provider: string): string =>
	`${provider.charAt(0).toUpperCase()}${provider.slice(1)} User`

export class ChatSyncAttributionReconciler extends Effect.Service<ChatSyncAttributionReconciler>()(
	"ChatSyncAttributionReconciler",
	{
		accessors: true,
		effect: Effect.gen(function* () {
			const messageRepo = yield* MessageRepo
			const userRepo = yield* UserRepo
			const organizationMemberRepo = yield* OrganizationMemberRepo

			const getOrCreateShadowUserId = Effect.fn(
				"ChatSyncAttributionReconciler.getOrCreateShadowUserId",
			)(function* (params: {
				provider: IntegrationConnection.IntegrationProvider
				externalAccountId: string
				organizationId: OrganizationId
				displayName?: string | null
			}) {
				const externalId = `${params.provider}-user-${params.externalAccountId}`
				const displayName = params.displayName?.trim() || defaultShadowDisplayName(params.provider)
				const user = yield* userRepo
					.upsertByExternalId(
						{
							externalId,
							email: `${externalId}@${params.provider}.internal`,
							firstName: displayName,
							lastName: "",
							avatarUrl: "",
							userType: "machine",
							settings: null,
							isOnboarded: true,
							timezone: null,
							deletedAt: null,
						},
						{ syncAvatarUrl: true },
					)
					.pipe(withSystemActor)

				yield* organizationMemberRepo
					.upsertByOrgAndUser({
						organizationId: params.organizationId,
						userId: user.id,
						role: "member",
						nickname: null,
						joinedAt: new Date(),
						invitedBy: null,
						deletedAt: null,
					})
					.pipe(withSystemActor)

				return user.id
			})

			const relinkHistoricalProviderMessages = Effect.fn(
				"ChatSyncAttributionReconciler.relinkHistoricalProviderMessages",
			)(function* (params: ReconcileAttributionParams) {
				const shadowUserId = yield* getOrCreateShadowUserId({
					provider: params.provider,
					externalAccountId: params.externalAccountId,
					organizationId: params.organizationId,
					displayName: params.externalAccountName,
				})

				const updatedCount = yield* messageRepo
					.reassignExternalSyncedAuthors({
						organizationId: params.organizationId,
						provider: params.provider,
						fromAuthorId: shadowUserId,
						toAuthorId: params.userId,
					})
					.pipe(withSystemActor)

				yield* Effect.logInfo("Historical external messages re-attributed to linked user", {
					event: "chat_sync_attribution_relinked",
					provider: params.provider,
					organizationId: params.organizationId,
					userId: params.userId,
					externalAccountId: params.externalAccountId,
					shadowUserId,
					updatedCount,
				})

				return { updatedCount }
			})

			const unlinkHistoricalProviderMessages = Effect.fn(
				"ChatSyncAttributionReconciler.unlinkHistoricalProviderMessages",
			)(function* (params: ReconcileAttributionParams) {
				const shadowUserId = yield* getOrCreateShadowUserId({
					provider: params.provider,
					externalAccountId: params.externalAccountId,
					organizationId: params.organizationId,
					displayName: params.externalAccountName,
				})

				const updatedCount = yield* messageRepo
					.reassignExternalSyncedAuthors({
						organizationId: params.organizationId,
						provider: params.provider,
						fromAuthorId: params.userId,
						toAuthorId: shadowUserId,
					})
					.pipe(withSystemActor)

				yield* Effect.logInfo("Historical external messages re-attributed to shadow user", {
					event: "chat_sync_attribution_unlinked",
					provider: params.provider,
					organizationId: params.organizationId,
					userId: params.userId,
					externalAccountId: params.externalAccountId,
					shadowUserId,
					updatedCount,
				})

				return { updatedCount }
			})

			return {
				relinkHistoricalProviderMessages,
				unlinkHistoricalProviderMessages,
			}
		}),
		dependencies: [MessageRepo.Default, UserRepo.Default, OrganizationMemberRepo.Default],
	},
) {}
