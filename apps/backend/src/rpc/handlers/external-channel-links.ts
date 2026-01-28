import { Database } from "@hazel/db"
import { CurrentUser, policyUse, withRemapDbErrors, withSystemActor } from "@hazel/domain"
import {
	ChannelNotFoundError,
	ExternalChannelLinkNotFoundError,
	ExternalChannelLinkResponse,
	ExternalChannelLinksListResponse,
	ExternalChannelLinkRpcs,
	ExternalLinkAlreadyExistsError,
} from "@hazel/domain/rpc"
import { Effect, Option } from "effect"
import { generateTransactionId } from "../../lib/create-transactionId"
import { ExternalChannelLinkPolicy } from "../../policies/external-channel-link-policy"
import { ChannelRepo } from "../../repositories/channel-repo"
import { ExternalChannelLinkRepo } from "../../repositories/external-channel-link-repo"

/**
 * External Channel Link RPC Handlers
 *
 * Implements the business logic for all external channel link-related RPC methods.
 * Only organization admins can manage external channel links.
 */
export const ExternalChannelLinkRpcLive = ExternalChannelLinkRpcs.toLayer(
	Effect.gen(function* () {
		const db = yield* Database.Database

		return {
			"externalChannelLink.list": ({ channelId }) =>
				Effect.gen(function* () {
					const linkRepo = yield* ExternalChannelLinkRepo

					const links = yield* linkRepo.findByChannelId(channelId)

					return new ExternalChannelLinksListResponse({ data: links })
				}).pipe(
					policyUse(ExternalChannelLinkPolicy.canRead(channelId)),
					withRemapDbErrors("ExternalChannelLink", "select"),
				),

			"externalChannelLink.listByOrg": ({ organizationId }) =>
				Effect.gen(function* () {
					const linkRepo = yield* ExternalChannelLinkRepo

					const links = yield* linkRepo.findByOrganizationId(organizationId)

					return new ExternalChannelLinksListResponse({ data: links })
				}).pipe(
					policyUse(ExternalChannelLinkPolicy.canReadOrg(organizationId)),
					withRemapDbErrors("ExternalChannelLink", "select"),
				),

			"externalChannelLink.create": (payload) =>
				db
					.transaction(
						Effect.gen(function* () {
							const user = yield* CurrentUser.Context
							const channelRepo = yield* ChannelRepo
							const linkRepo = yield* ExternalChannelLinkRepo

							// Verify channel exists
							const channelOption = yield* channelRepo
								.findById(payload.channelId)
								.pipe(withSystemActor)
							if (Option.isNone(channelOption)) {
								return yield* Effect.fail(
									new ChannelNotFoundError({ channelId: payload.channelId }),
								)
							}

							// Check for existing link
							const existing = yield* linkRepo
								.findExisting(payload.channelId, payload.provider, payload.externalChannelId)
								.pipe(withSystemActor)

							if (Option.isSome(existing)) {
								return yield* Effect.fail(
									new ExternalLinkAlreadyExistsError({
										channelId: payload.channelId,
										provider: payload.provider,
										externalChannelId: payload.externalChannelId,
									}),
								)
							}

							// Create the link
							const [link] = yield* linkRepo
								.insert({
									channelId: payload.channelId,
									organizationId: payload.organizationId,
									provider: payload.provider,
									externalWorkspaceId: payload.externalWorkspaceId,
									externalWorkspaceName: payload.externalWorkspaceName,
									externalChannelId: payload.externalChannelId,
									externalChannelName: payload.externalChannelName,
									syncDirection: payload.syncDirection,
									config: payload.config,
									isEnabled: payload.isEnabled,
									createdBy: user.id,
									deletedAt: null,
								})
								.pipe(withSystemActor)

							const txid = yield* generateTransactionId()

							return new ExternalChannelLinkResponse({
								data: link,
								transactionId: txid,
							})
						}).pipe(policyUse(ExternalChannelLinkPolicy.canCreate(payload.channelId))),
					)
					.pipe(withRemapDbErrors("ExternalChannelLink", "create")),

			"externalChannelLink.update": ({ id, ...payload }) =>
				db
					.transaction(
						Effect.gen(function* () {
							const linkRepo = yield* ExternalChannelLinkRepo

							// Check link exists
							const linkOption = yield* linkRepo.findById(id).pipe(withSystemActor)
							if (Option.isNone(linkOption)) {
								return yield* Effect.fail(new ExternalChannelLinkNotFoundError({ id }))
							}

							// Update the link
							const updatedLink = yield* linkRepo
								.update({
									id,
									syncDirection: payload.syncDirection,
									config: payload.config,
									isEnabled: payload.isEnabled,
								})
								.pipe(withSystemActor)

							const txid = yield* generateTransactionId()

							return new ExternalChannelLinkResponse({
								data: updatedLink,
								transactionId: txid,
							})
						}).pipe(policyUse(ExternalChannelLinkPolicy.canUpdate(id))),
					)
					.pipe(withRemapDbErrors("ExternalChannelLink", "update")),

			"externalChannelLink.delete": ({ id }) =>
				db
					.transaction(
						Effect.gen(function* () {
							const linkRepo = yield* ExternalChannelLinkRepo

							// Check link exists
							const linkOption = yield* linkRepo.findById(id).pipe(withSystemActor)
							if (Option.isNone(linkOption)) {
								return yield* Effect.fail(new ExternalChannelLinkNotFoundError({ id }))
							}

							// Soft delete
							yield* linkRepo.softDelete(id)

							const txid = yield* generateTransactionId()

							return { transactionId: txid }
						}).pipe(policyUse(ExternalChannelLinkPolicy.canDelete(id))),
					)
					.pipe(withRemapDbErrors("ExternalChannelLink", "delete")),
		}
	}),
)
