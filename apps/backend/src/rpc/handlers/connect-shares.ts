import {
	ChannelMemberRepo,
	ChannelRepo,
	ConnectConversationChannelRepo,
	ConnectConversationRepo,
	ConnectInviteRepo,
	ConnectParticipantRepo,
	OrganizationMemberRepo,
	OrganizationRepo,
} from "@hazel/backend-core"
import { and, Database, eq, ilike, isNull, or, schema } from "@hazel/db"
import { CurrentUser, InternalServerError, PermissionError, UnauthorizedError } from "@hazel/domain"
import {
	ConnectChannelAlreadySharedError,
	ConnectConversationResponse,
	ConnectInviteInvalidStateError,
	ConnectInviteListResponse,
	ConnectInviteNotFoundError,
	ConnectInviteResponse,
	ConnectShareRpcs,
	ConnectWorkspaceNotFoundError,
	ConnectWorkspaceSearchResponse,
	ConnectWorkspaceSearchResult,
	ConnectParticipantResponse,
} from "@hazel/domain/rpc"
import type { ChannelId, ConnectConversationId, OrganizationId, UserId } from "@hazel/schema"
import { Effect, Option } from "effect"
import { generateTransactionId } from "../../lib/create-transactionId"
import { ChannelAccessSyncService } from "../../services/channel-access-sync"
import { ConnectConversationService } from "../../services/connect-conversation-service"
import { OrgResolver } from "../../services/org-resolver"

export const ConnectShareRpcLive = ConnectShareRpcs.toLayer(
	Effect.gen(function* () {
		const db = yield* Database.Database
		const orgRepo = yield* OrganizationRepo
		const orgMemberRepo = yield* OrganizationMemberRepo
		const channelRepo = yield* ChannelRepo
		const channelMemberRepo = yield* ChannelMemberRepo
		const connectConversationRepo = yield* ConnectConversationRepo
		const connectConversationChannelRepo = yield* ConnectConversationChannelRepo
		const connectInviteRepo = yield* ConnectInviteRepo
		const connectParticipantRepo = yield* ConnectParticipantRepo
		const connectConversationService = yield* ConnectConversationService
		const orgResolver = yield* OrgResolver
		const channelAccessSync = yield* ChannelAccessSyncService

		const requireAdminOrOwner = (organizationId: OrganizationId) =>
			orgResolver.requireAdminOrOwner(organizationId, "organizations:write", "ConnectShare", "manage")

		const requireDisconnectAuthority = Effect.fn("ConnectShare.requireDisconnectAuthority")(function* (
			hostOrganizationId: OrganizationId,
			targetOrganizationId: OrganizationId,
		) {
			if (targetOrganizationId === hostOrganizationId) {
				yield* requireAdminOrOwner(hostOrganizationId)
				return
			}

			const hostAttempt = yield* requireAdminOrOwner(hostOrganizationId).pipe(Effect.either)
			if (hostAttempt._tag === "Right") return

			yield* requireAdminOrOwner(targetOrganizationId)
		})

		const upsertParticipantProjection = Effect.fn("ConnectShare.upsertParticipantProjection")(function* (
			conversationId: ConnectConversationId,
			userId: UserId,
			homeOrganizationId: OrganizationId,
			addedBy: UserId,
		) {
			const mounts = yield* connectConversationChannelRepo.findByConversationId(conversationId)
			for (const mount of mounts) {
				const existing = yield* connectParticipantRepo.findByChannelAndUser(mount.channelId, userId)
				if (Option.isSome(existing)) {
					yield* connectParticipantRepo.update({
						id: existing.value.id,
						homeOrganizationId,
						isExternal: mount.organizationId !== homeOrganizationId,
						addedBy,
						deletedAt: null,
					})
					continue
				}

				yield* connectParticipantRepo.insert({
					conversationId,
					channelId: mount.channelId,
					userId,
					homeOrganizationId,
					isExternal: mount.organizationId !== homeOrganizationId,
					addedBy,
					deletedAt: null,
				})
			}
		})

		const remapConnectErrors = (effect: Effect.Effect<any, any, any>, message: string): any =>
			(effect as any).pipe(
				Effect.catchAll((error: any) => {
					if (error?._tag === "PermissionError") {
						return Effect.fail(
							new UnauthorizedError({
								message: error.message,
								detail: error.requiredScope ?? undefined,
							}),
						)
					}
					if (error?._tag === "DatabaseError" || error?._tag === "ParseError") {
						return Effect.fail(
							new InternalServerError({
								message,
								detail: String(error),
							}),
						)
					}
					return Effect.fail(error)
				}),
			)

		return {
			"connectShare.workspace.search": ({ query, organizationId }) =>
				remapConnectErrors(
					Effect.gen(function* () {
						yield* orgResolver.requireScope(
							organizationId,
							"organizations:read",
							"ConnectShare",
							"workspace.search",
						)
						const results = yield* db.makeQuery((execute, input: string) =>
							execute((client) =>
								client
									.select({
										id: schema.organizationsTable.id,
										name: schema.organizationsTable.name,
										slug: schema.organizationsTable.slug,
										logoUrl: schema.organizationsTable.logoUrl,
									})
									.from(schema.organizationsTable)
									.where(
										and(
											isNull(schema.organizationsTable.deletedAt),
											eq(schema.organizationsTable.isPublic, true),
											or(
												ilike(schema.organizationsTable.name, `%${input}%`),
												ilike(schema.organizationsTable.slug, `%${input}%`),
											),
										),
									)
									.limit(10),
							),
						)(query)

						const filtered = results.filter((result) => result.id !== organizationId)

						return new ConnectWorkspaceSearchResponse({
							data: filtered.map((r) => new ConnectWorkspaceSearchResult(r)),
						})
					}),
					"Database error while searching workspaces",
				),

			"connectShare.invite.create": ({
				channelId,
				guestOrganizationId: providedOrgId,
				target,
				allowGuestMemberAdds,
			}) =>
				remapConnectErrors(
					db.transaction(
						Effect.gen(function* () {
							const currentUser = yield* CurrentUser.Context
							const channelOption = yield* channelRepo.findById(channelId)
							if (Option.isNone(channelOption)) {
								return yield* Effect.fail(
									new InternalServerError({
										message: "Channel not found while creating Hazel Connect invite",
										detail: `channelId=${channelId}`,
									}),
								)
							}
							const channel = channelOption.value
							yield* requireAdminOrOwner(channel.organizationId)

							const mount = yield* connectConversationService.ensureChannelConversation(
								channel.id,
								currentUser.id,
							)

							const guestOrganization = yield* Effect.gen(function* () {
								if (providedOrgId) return providedOrgId
								if (target.kind !== "slug") {
									return null as OrganizationId | null
								}
								const orgOption = yield* orgRepo.findBySlug(target.value)
								if (Option.isNone(orgOption)) {
									return yield* Effect.fail(
										new ConnectWorkspaceNotFoundError({
											message: `No workspace found for slug '${target.value}'`,
										}),
									)
								}
								return orgOption.value.id
							})

							if (guestOrganization) {
								const existingMount =
									yield* connectConversationChannelRepo.findByConversationAndOrganization(
										mount.conversationId,
										guestOrganization,
									)
								if (Option.isSome(existingMount)) {
									return yield* Effect.fail(
										new ConnectChannelAlreadySharedError({
											channelId,
											organizationId: guestOrganization,
											message: "This channel is already shared with that workspace",
										}),
									)
								}
							}

							const invite = yield* connectInviteRepo
								.insert({
									conversationId: mount.conversationId,
									hostOrganizationId: channel.organizationId,
									hostChannelId: channel.id,
									targetKind: target.kind,
									targetValue: target.value,
									guestOrganizationId: guestOrganization,
									status: "pending",
									allowGuestMemberAdds,
									invitedBy: currentUser.id,
									acceptedBy: null,
									acceptedAt: null,
									expiresAt: null,
									deletedAt: null,
								})
								.pipe(Effect.map((results) => results[0]!))

							const txid = yield* generateTransactionId()
							return new ConnectInviteResponse({ data: invite, transactionId: txid })
						}),
					),
					"Database error while creating Hazel Connect invite",
				),

			"connectShare.invite.accept": ({ inviteId, guestOrganizationId }) =>
				remapConnectErrors(
					db.transaction(
						Effect.gen(function* () {
							const currentUser = yield* CurrentUser.Context
							yield* requireAdminOrOwner(guestOrganizationId)

							const inviteOption = yield* connectInviteRepo.findActiveById(inviteId)
							if (Option.isNone(inviteOption)) {
								return yield* Effect.fail(
									new ConnectInviteNotFoundError({
										inviteId,
										message: "Hazel Connect invite not found",
									}),
								)
							}
							const invite = inviteOption.value

							if (invite.status !== "pending") {
								return yield* Effect.fail(
									new ConnectInviteInvalidStateError({
										inviteId,
										status: invite.status,
										message: "Only pending Hazel Connect invites can be accepted",
									}),
								)
							}

							if (
								invite.guestOrganizationId &&
								invite.guestOrganizationId !== guestOrganizationId
							) {
								return yield* Effect.fail(
									new ConnectWorkspaceNotFoundError({
										message: "This invite targets a different workspace",
									}),
								)
							}

							const hostChannelOption = yield* channelRepo.findById(invite.hostChannelId)
							if (Option.isNone(hostChannelOption)) {
								return yield* Effect.fail(
									new InternalServerError({
										message: "Host channel missing while accepting Hazel Connect invite",
										detail: `hostChannelId=${invite.hostChannelId}`,
									}),
								)
							}
							const hostChannel = hostChannelOption.value

							const existingMount =
								yield* connectConversationChannelRepo.findByConversationAndOrganization(
									invite.conversationId,
									guestOrganizationId,
								)
							if (Option.isSome(existingMount)) {
								return yield* Effect.fail(
									new ConnectChannelAlreadySharedError({
										channelId: existingMount.value.channelId,
										organizationId: guestOrganizationId,
										message: "This workspace is already connected to the conversation",
									}),
								)
							}

							const guestChannel = yield* channelRepo
								.insert({
									name: hostChannel.name,
									icon: hostChannel.icon,
									type: hostChannel.type,
									organizationId: guestOrganizationId,
									parentChannelId: null,
									sectionId: null,
									deletedAt: null,
								})
								.pipe(Effect.map((results) => results[0]!))

							yield* channelMemberRepo.insert({
								channelId: guestChannel.id,
								userId: currentUser.id,
								isHidden: false,
								isMuted: false,
								isFavorite: false,
								lastSeenMessageId: null,
								notificationCount: 0,
								joinedAt: new Date(),
								deletedAt: null,
							})
							yield* connectConversationChannelRepo.insert({
								conversationId: invite.conversationId,
								organizationId: guestOrganizationId,
								channelId: guestChannel.id,
								role: "guest",
								allowGuestMemberAdds: invite.allowGuestMemberAdds,
								isActive: true,
								deletedAt: null,
							})

							yield* connectInviteRepo.update({
								id: invite.id,
								status: "accepted",
								guestOrganizationId,
								acceptedBy: currentUser.id,
								acceptedAt: new Date(),
							})

							yield* connectConversationRepo.update({
								id: invite.conversationId,
								status: "active",
							})

							const hostMemberRows = yield* db.makeQuery((execute, input: ChannelId) =>
								execute((client) =>
									client
										.select({
											userId: schema.channelMembersTable.userId,
										})
										.from(schema.channelMembersTable)
										.where(
											and(
												eq(schema.channelMembersTable.channelId, input),
												isNull(schema.channelMembersTable.deletedAt),
											),
										),
								),
							)(hostChannel.id)

							for (const hostMember of hostMemberRows) {
								yield* upsertParticipantProjection(
									invite.conversationId,
									hostMember.userId,
									hostChannel.organizationId,
									currentUser.id,
								)
							}

							yield* upsertParticipantProjection(
								invite.conversationId,
								currentUser.id,
								guestOrganizationId,
								currentUser.id,
							)

							// Sync all channels in the conversation so cross-org users get access
							yield* channelAccessSync.syncConversation(invite.conversationId)

							const conversation = yield* connectConversationRepo
								.findById(invite.conversationId)
								.pipe(
									Effect.map((result) =>
										Option.getOrElse(result, () => {
											throw new Error(
												"Connect conversation disappeared during acceptance",
											)
										}),
									),
								)
							const txid = yield* generateTransactionId()
							return new ConnectConversationResponse({
								data: conversation,
								transactionId: txid,
							})
						}),
					),
					"Database error while accepting Hazel Connect invite",
				),

			"connectShare.invite.decline": ({ inviteId }) =>
				remapConnectErrors(
					db.transaction(
						Effect.gen(function* () {
							const inviteOption = yield* connectInviteRepo.findActiveById(inviteId)
							if (Option.isNone(inviteOption)) {
								return yield* Effect.fail(
									new ConnectInviteNotFoundError({
										inviteId,
										message: "Hazel Connect invite not found",
									}),
								)
							}
							if (inviteOption.value.status !== "pending") {
								return yield* Effect.fail(
									new ConnectInviteInvalidStateError({
										inviteId,
										status: inviteOption.value.status,
										message: "Only pending Hazel Connect invites can be declined",
									}),
								)
							}
							if (!inviteOption.value.guestOrganizationId) {
								return yield* Effect.fail(
									new ConnectWorkspaceNotFoundError({
										message: "This invite is not bound to a workspace",
									}),
								)
							}
							yield* requireAdminOrOwner(inviteOption.value.guestOrganizationId)
							yield* connectInviteRepo.update({
								id: inviteId,
								status: "declined",
							})
							return { transactionId: yield* generateTransactionId() }
						}),
					),
					"Database error while declining Hazel Connect invite",
				),

			"connectShare.invite.revoke": ({ inviteId }) =>
				remapConnectErrors(
					db.transaction(
						Effect.gen(function* () {
							const inviteOption = yield* connectInviteRepo.findActiveById(inviteId)
							if (Option.isNone(inviteOption)) {
								return yield* Effect.fail(
									new ConnectInviteNotFoundError({
										inviteId,
										message: "Hazel Connect invite not found",
									}),
								)
							}
							const invite = inviteOption.value
							yield* requireAdminOrOwner(invite.hostOrganizationId)
							if (invite.status !== "pending") {
								return yield* Effect.fail(
									new ConnectInviteInvalidStateError({
										inviteId,
										status: invite.status,
										message: "Only pending Hazel Connect invites can be revoked",
									}),
								)
							}
							yield* connectInviteRepo.update({
								id: inviteId,
								status: "revoked",
							})
							return { transactionId: yield* generateTransactionId() }
						}),
					),
					"Database error while revoking Hazel Connect invite",
				),

			"connectShare.invite.listIncoming": ({ organizationId }) =>
				remapConnectErrors(
					Effect.gen(function* () {
						yield* orgResolver.requireScope(
							organizationId,
							"organizations:read",
							"ConnectShare",
							"listIncoming",
						)
						const invites = yield* connectInviteRepo.listIncomingForOrganization(organizationId)
						return new ConnectInviteListResponse({ data: invites })
					}),
					"Database error while listing incoming Hazel Connect invites",
				),

			"connectShare.invite.listOutgoing": ({ organizationId }) =>
				remapConnectErrors(
					Effect.gen(function* () {
						yield* orgResolver.requireScope(
							organizationId,
							"organizations:read",
							"ConnectShare",
							"listOutgoing",
						)
						const invites = yield* connectInviteRepo.listOutgoingForOrganization(organizationId)
						return new ConnectInviteListResponse({ data: invites })
					}),
					"Database error while listing outgoing Hazel Connect invites",
				),

			"connectShare.settings.update": ({ conversationId, allowGuestMemberAdds, status }) =>
				remapConnectErrors(
					db.transaction(
						Effect.gen(function* () {
							const conversationOption = yield* connectConversationRepo.findById(conversationId)
							if (Option.isNone(conversationOption)) {
								return yield* Effect.fail(
									new InternalServerError({
										message: "Hazel Connect conversation not found",
										detail: `conversationId=${conversationId}`,
									}),
								)
							}
							const conversation = conversationOption.value
							yield* requireAdminOrOwner(conversation.hostOrganizationId)
							const updated = yield* connectConversationRepo.update({
								id: conversationId,
								status: status ?? conversation.status,
								settings: conversation.settings ?? null,
							})
							if (allowGuestMemberAdds !== undefined) {
								const mounts =
									yield* connectConversationChannelRepo.findByConversationId(conversationId)
								yield* Effect.forEach(
									mounts.filter((mount) => mount.role === "guest"),
									(mount) =>
										connectConversationChannelRepo.update({
											id: mount.id,
											allowGuestMemberAdds,
										}),
									{ concurrency: 10 },
								)
							}
							const txid = yield* generateTransactionId()
							return new ConnectConversationResponse({ data: updated, transactionId: txid })
						}),
					),
					"Database error while updating Hazel Connect settings",
				),

			"connectShare.member.add": ({ channelId, userId }) =>
				remapConnectErrors(
					db.transaction(
						Effect.gen(function* () {
							const currentUser = yield* CurrentUser.Context
							const channelOption = yield* channelRepo.findById(channelId)
							if (Option.isNone(channelOption)) {
								return yield* Effect.fail(
									new InternalServerError({
										message: "Channel not found while adding connect participant",
										detail: `channelId=${channelId}`,
									}),
								)
							}
							const channel = channelOption.value
							yield* orgResolver.fromChannel(
								channelId,
								"channel-members:write",
								"ConnectShare",
								"member.add",
							)

							const conversationId =
								yield* connectConversationService.getConversationIdForChannel(channelId)
							if (!conversationId) {
								return yield* Effect.fail(
									new InternalServerError({
										message: "No conversation available for channel",
										detail: `channelId=${channelId}`,
									}),
								)
							}
							const mountOption =
								yield* connectConversationService.getMountForChannel(channelId)
							const mount = Option.getOrNull(mountOption)
							if (mount?.role === "guest" && !mount.allowGuestMemberAdds) {
								return yield* Effect.fail(
									new PermissionError({
										message:
											"This guest workspace cannot add members to the shared channel",
										requiredScope: "channel-members:write",
									}),
								)
							}
							const userOrgMembership = yield* orgMemberRepo.findByOrgAndUser(
								channel.organizationId,
								userId,
							)
							if (Option.isNone(userOrgMembership)) {
								return yield* Effect.fail(
									new ConnectWorkspaceNotFoundError({
										message: "Only members of the current workspace can be added here",
									}),
								)
							}

							const membership = yield* channelMemberRepo.findByChannelAndUser(
								channelId,
								userId,
							)
							if (Option.isNone(membership)) {
								yield* channelMemberRepo.insert({
									channelId,
									userId,
									isHidden: false,
									isMuted: false,
									isFavorite: false,
									lastSeenMessageId: null,
									notificationCount: 0,
									joinedAt: new Date(),
									deletedAt: null,
								})
								yield* channelAccessSync.syncChannel(channelId)
							}

							yield* upsertParticipantProjection(
								conversationId,
								userId,
								channel.organizationId,
								currentUser.id,
							)

							// Sync all channels so the new participant gets access across the conversation
							yield* channelAccessSync.syncConversation(conversationId)

							const participant = yield* connectParticipantRepo
								.findByChannelAndUser(channelId, userId)
								.pipe(
									Effect.map((result) =>
										Option.getOrElse(result, () => {
											throw new Error("Connect participant missing after upsert")
										}),
									),
								)
							const txid = yield* generateTransactionId()
							return new ConnectParticipantResponse({ data: participant, transactionId: txid })
						}),
					),
					"Database error while adding Hazel Connect participant",
				),

			"connectShare.member.remove": ({ channelId, userId }) =>
				remapConnectErrors(
					db.transaction(
						Effect.gen(function* () {
							const channelOption = yield* channelRepo.findById(channelId)
							if (Option.isNone(channelOption)) {
								return yield* Effect.fail(
									new InternalServerError({
										message: "Channel not found while removing connect participant",
										detail: `channelId=${channelId}`,
									}),
								)
							}
							const channel = channelOption.value
							yield* orgResolver.fromChannel(
								channelId,
								"channel-members:write",
								"ConnectShare",
								"member.remove",
							)
							const userOrgMembership = yield* orgMemberRepo.findByOrgAndUser(
								channel.organizationId,
								userId,
							)
							if (Option.isNone(userOrgMembership)) {
								return yield* Effect.fail(
									new ConnectWorkspaceNotFoundError({
										message: "Only members of the current workspace can be removed here",
									}),
								)
							}
							const conversationId =
								yield* connectConversationService.getConversationIdForChannel(channelId)
							const membership = yield* channelMemberRepo.findByChannelAndUser(
								channelId,
								userId,
							)
							if (Option.isSome(membership)) {
								yield* channelMemberRepo.deleteById(membership.value.id)
							}
							if (conversationId) {
								yield* connectConversationService.removeParticipantFromConversation(
									conversationId,
									userId,
								)
							} else {
								yield* channelAccessSync.syncChannel(channelId)
							}
							return { transactionId: yield* generateTransactionId() }
						}),
					),
					"Database error while removing Hazel Connect participant",
				),

			"connectShare.organization.disconnect": ({ conversationId, organizationId }) =>
				remapConnectErrors(
					db.transaction(
						Effect.gen(function* () {
							const conversationOption = yield* connectConversationRepo.findById(conversationId)
							if (Option.isNone(conversationOption)) {
								return yield* Effect.fail(
									new InternalServerError({
										message: "Hazel Connect conversation not found",
										detail: `conversationId=${conversationId}`,
									}),
								)
							}
							yield* requireDisconnectAuthority(
								conversationOption.value.hostOrganizationId,
								organizationId,
							)
							yield* connectConversationService.disconnectOrganization(
								conversationId,
								organizationId,
							)
							return { transactionId: yield* generateTransactionId() }
						}),
					),
					"Database error while disconnecting Hazel Connect organization",
				),
		}
	}),
)
