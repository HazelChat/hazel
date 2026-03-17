import { GeneratePortalLinkIntent } from "@workos-inc/node"
import type { OrganizationId } from "@hazel/schema"
import {
	ChannelMemberRepo,
	ChannelRepo,
	OrganizationMemberRepo,
	OrganizationRepo,
	UserRepo,
} from "@hazel/backend-core"
import { Database } from "@hazel/db"
import { CurrentUser, InternalServerError, withRemapDbErrors } from "@hazel/domain"
import {
	AlreadyMemberError,
	OrganizationNotFoundError,
	OrganizationResponse,
	OrganizationRpcs,
	OrganizationSlugAlreadyExistsError,
	PublicInviteDisabledError,
} from "@hazel/domain/rpc"
import { Effect, Option, Predicate } from "effect"
import { generateTransactionId } from "../../lib/create-transactionId"
import { OrganizationPolicy } from "../../policies/organization-policy"
import { ChannelAccessSyncService } from "../../services/channel-access-sync"
import { WorkOSAuth as WorkOS } from "../../services/workos-auth"

const UNKNOWN_ORGANIZATION_ID = "00000000-0000-4000-8000-000000000000" as OrganizationId

/**
 * Custom error handler for organization database operations that provides
 * specific error handling for duplicate slug violations
 */
const handleOrganizationDbErrors = <R, E extends { _tag: string }, A>(
	entityType: string,
	action: "update" | "create",
) => {
	return (
		effect: Effect.Effect<R, E, A>,
	): Effect.Effect<
		R,
		| Exclude<E, { _tag: "DatabaseError" | "SchemaError" }>
		| InternalServerError
		| OrganizationSlugAlreadyExistsError,
		A
	> => {
		return effect.pipe(
			Effect.catchIf(
				(e): e is Extract<E, { _tag: "DatabaseError" }> => Predicate.isTagged(e, "DatabaseError"),
				(err): Effect.Effect<never, InternalServerError | OrganizationSlugAlreadyExistsError> => {
					const dbErr = err as unknown as {
						type: string
						cause: { constraint_name?: string; detail?: string }
					}
					// Check if it's a unique violation on the slug column
					if (
						dbErr.type === "unique_violation" &&
						dbErr.cause.constraint_name === "organizations_slug_unique"
					) {
						// Extract slug from error detail if possible
						const slugMatch = dbErr.cause.detail?.match(/Key \(slug\)=\(([^)]+)\)/)
						const slug = slugMatch?.[1] || "unknown"
						return Effect.fail(
							new OrganizationSlugAlreadyExistsError({
								message: `Organization slug '${slug}' is already taken`,
								slug,
							}),
						)
					}
					// For other database errors, return a generic internal server error
					return Effect.fail(
						new InternalServerError({
							message: `Error ${action}ing ${entityType}`,
							detail: `There was a database error when ${action}ing the ${entityType}`,
							cause: String(err),
						}),
					)
				},
			),
			Effect.catchIf(
				(e): e is Extract<E, { _tag: "SchemaError" }> => Predicate.isTagged(e, "SchemaError"),
				(err) =>
					Effect.fail(
						new InternalServerError({
							message: `Error ${action}ing ${entityType}`,
							detail: `There was an error in parsing when ${action}ing the ${entityType}`,
							cause: String(err),
						}),
					),
			),
		) as Effect.Effect<
			R,
			| Exclude<E, { _tag: "DatabaseError" | "SchemaError" }>
			| InternalServerError
			| OrganizationSlugAlreadyExistsError,
			A
		>
	}
}

/**
 * Organization RPC Handlers
 *
 * Implements the business logic for all organization-related RPC methods.
 * Each handler receives the payload and has access to CurrentUser via Effect context
 * (provided by AuthMiddleware).
 *
 * All handlers use:
 * - Database transactions for atomicity
 * - Policy checks for authorization
 * - Transaction IDs for optimistic updates
 * - Error remapping for consistent error handling including slug uniqueness violations
 */
export const OrganizationRpcLive = OrganizationRpcs.toLayer(
	Effect.gen(function* () {
		const db = yield* Database.Database
		const workos = yield* WorkOS
		const organizationRepo = yield* OrganizationRepo
		const organizationPolicy = yield* OrganizationPolicy
		const channelRepo = yield* ChannelRepo
		const channelMemberRepo = yield* ChannelMemberRepo
		const organizationMemberRepo = yield* OrganizationMemberRepo
		const userRepo = yield* UserRepo
		const channelAccessSync = yield* ChannelAccessSyncService

		return {
			"organization.create": (payload) =>
				db
					.transaction(
						Effect.gen(function* () {
							// Get current user from context
							const currentUser = yield* CurrentUser.Context

							// Get the user's external ID (WorkOS user ID)
							const userOption = yield* userRepo.findById(currentUser.id).pipe(
								Effect.catchTags({
									DatabaseError: (err) =>
										Effect.fail(
											new InternalServerError({
												message: "Failed to query user",
												detail: String(err),
											}),
										),
								}),
							)
							if (userOption._tag === "None") {
								return yield* Effect.fail(
									new InternalServerError({
										message: "User not found",
										detail: `Could not find user with ID ${currentUser.id}`,
									}),
								)
							}

							const user = userOption.value

							// Check if slug already exists
							if (payload.slug) {
								const existingOrganization = yield* organizationRepo.findBySlug(payload.slug)

								if (Option.isSome(existingOrganization)) {
									return yield* Effect.fail(
										new OrganizationSlugAlreadyExistsError({
											message: `Organization slug '${payload.slug}' is already taken`,
											slug: payload.slug,
										}),
									)
								}
							}

							// Create organization in local database first
							yield* organizationPolicy.canCreate()
							const createdOrganization = yield* organizationRepo
								.insert({
									name: payload.name,
									slug: payload.slug,
									logoUrl: payload.logoUrl,
									settings: payload.settings,
									isPublic: false,
									deletedAt: null,
								})
								.pipe(Effect.map((res) => res[0]!))

							// Create organization in WorkOS using our DB ID as externalId
							const workosOrg = yield* workos
								.call((client) =>
									client.organizations.createOrganization({
										name: payload.name,
										externalId: createdOrganization.id,
									}),
								)
								.pipe(
									Effect.mapError(
										(error) =>
											new InternalServerError({
												message: "Failed to create organization in WorkOS",
												detail: String(error.cause),
												cause: String(error),
											}),
									),
								)

							yield* workos
								.call((client) =>
									client.userManagement.createOrganizationMembership({
										userId: user.externalId,
										organizationId: workosOrg.id,
										roleSlug: "owner",
									}),
								)
								.pipe(
									Effect.mapError(
										(error) =>
											new InternalServerError({
												message: "Failed to add user to organization in WorkOS",
												detail: String(error.cause),
												cause: String(error),
											}),
									),
								)

							yield* organizationMemberRepo.upsertByOrgAndUser({
								organizationId: createdOrganization.id,
								userId: currentUser.id,
								role: "owner",
								nickname: undefined,
								joinedAt: new Date(),
								invitedBy: null,
								deletedAt: null,
							})

							// Setup default channels for the organization
							yield* organizationRepo.setupDefaultChannels(
								createdOrganization.id,
								currentUser.id,
							)

							yield* channelAccessSync.syncUserInOrganization(
								currentUser.id,
								createdOrganization.id,
							)

							const txid = yield* generateTransactionId()

							return new OrganizationResponse({
								data: {
									...createdOrganization,
									settings: createdOrganization.settings as {
										readonly [x: string]: unknown
									} | null,
								},
								transactionId: txid,
							})
						}),
					)
					.pipe(handleOrganizationDbErrors("Organization", "create")),

			"organization.update": ({ id, ...payload }) =>
				db
					.transaction(
						Effect.gen(function* () {
							yield* Effect.logInfo("organizationRepo.update", payload)
							yield* organizationPolicy.canUpdate(id)
							const updatedOrganization = yield* organizationRepo.update({
								id,
								...payload,
							})

							const txid = yield* generateTransactionId()

							return new OrganizationResponse({
								data: {
									...updatedOrganization,
									settings: updatedOrganization.settings as {
										readonly [x: string]: unknown
									} | null,
								},
								transactionId: txid,
							})
						}),
					)
					.pipe(handleOrganizationDbErrors("Organization", "update")),

			"organization.delete": ({ id }) =>
				db
					.transaction(
						Effect.gen(function* () {
							yield* organizationPolicy.canDelete(id)
							yield* organizationRepo.deleteById(id)

							const txid = yield* generateTransactionId()

							return { transactionId: txid }
						}),
					)
					.pipe(withRemapDbErrors("Organization", "delete")),

			"organization.setSlug": ({ id, slug }) =>
				db
					.transaction(
						Effect.gen(function* () {
							yield* organizationPolicy.canUpdate(id)
							const updatedOrganization = yield* organizationRepo.update({
								id,
								slug,
							})

							const txid = yield* generateTransactionId()

							return new OrganizationResponse({
								data: {
									...updatedOrganization,
									settings: updatedOrganization.settings as {
										readonly [x: string]: unknown
									} | null,
								},
								transactionId: txid,
							})
						}),
					)
					.pipe(handleOrganizationDbErrors("Organization", "update")),

			"organization.setPublicMode": ({ id, isPublic }) =>
				db
					.transaction(
						Effect.gen(function* () {
							yield* organizationPolicy.canUpdate(id)
							const updatedOrganization = yield* organizationRepo.update({
								id,
								isPublic,
							})

							const txid = yield* generateTransactionId()

							return new OrganizationResponse({
								data: {
									...updatedOrganization,
									settings: updatedOrganization.settings as {
										readonly [x: string]: unknown
									} | null,
								},
								transactionId: txid,
							})
						}),
					)
					.pipe(withRemapDbErrors("Organization", "update")),

			"organization.getBySlugPublic": ({ slug }) =>
				Effect.gen(function* () {
					const orgOption = yield* organizationRepo.findBySlugIfPublic(slug)

					if (Option.isNone(orgOption)) {
						return null
					}

					const org = orgOption.value

					// Count members for this organization
					const memberCount = yield* organizationMemberRepo.countByOrganization(org.id)

					return {
						id: org.id,
						name: org.name,
						slug: org.slug,
						logoUrl: org.logoUrl,
						memberCount,
					}
				}).pipe(
					Effect.catchTags({
						DatabaseError: (err) =>
							Effect.fail(
								new InternalServerError({
									message: "Error fetching organization",
									detail: String(err),
								}),
							),
					}),
				),

			"organization.joinViaPublicInvite": ({ slug }) =>
				db
					.transaction(
						Effect.gen(function* () {
							const currentUser = yield* CurrentUser.Context

							// Find the organization by slug
							const orgOption = yield* organizationRepo.findBySlug(slug)

							if (Option.isNone(orgOption)) {
								return yield* new OrganizationNotFoundError({
									organizationId: UNKNOWN_ORGANIZATION_ID,
								})
							}

							const org = orgOption.value

							// Check if organization has public invites enabled
							if (!org.isPublic) {
								return yield* new PublicInviteDisabledError({
									organizationId: org.id,
								})
							}

							// Get the user's external ID for WorkOS sync
							const userOption = yield* userRepo.findById(currentUser.id).pipe(
								Effect.catchTags({
									DatabaseError: (err) =>
										Effect.fail(
											new InternalServerError({
												message: "Failed to query user",
												detail: String(err),
											}),
										),
								}),
							)

							if (Option.isNone(userOption)) {
								return yield* new InternalServerError({
									message: "User not found",
									detail: `Could not find user with ID ${currentUser.id}`,
								})
							}

							const user = userOption.value

							// Get WorkOS org first - fail early if not found
							const workosOrg = yield* workos
								.call((client) => client.organizations.getOrganizationByExternalId(org.id))
								.pipe(
									Effect.mapError(
										(error) =>
											new InternalServerError({
												message: "Failed to get WorkOS organization",
												detail: String(error),
											}),
									),
								)

							// Check if user is already a member in local DB
							const existingMember = yield* organizationMemberRepo.findByOrgAndUser(
								org.id,
								currentUser.id,
							)

							// Check WorkOS membership
							const workosMembers = yield* workos
								.call((client) =>
									client.userManagement.listOrganizationMemberships({
										organizationId: workosOrg.id,
										userId: user.externalId,
									}),
								)
								.pipe(Effect.catchTag("WorkOSAuthError", () => Effect.succeed({ data: [] })))

							const hasWorkosMembership = workosMembers.data.length > 0

							if (Option.isSome(existingMember) && hasWorkosMembership) {
								// Truly already a member in both systems
								return yield* new AlreadyMemberError({
									organizationId: org.id,
									organizationSlug: org.slug,
								})
							}

							// Create/ensure membership in local database
							yield* organizationMemberRepo.upsertByOrgAndUser({
								organizationId: org.id,
								userId: currentUser.id,
								role: "member",
								nickname: undefined,
								joinedAt: new Date(),
								invitedBy: null,
								deletedAt: null,
							})

							// Sync to WorkOS - REQUIRED, fails the transaction if it fails
							if (!hasWorkosMembership) {
								yield* workos
									.call((client) =>
										client.userManagement.createOrganizationMembership({
											userId: user.externalId,
											organizationId: workosOrg.id,
											roleSlug: "member",
										}),
									)
									.pipe(
										Effect.mapError(
											(error) =>
												new InternalServerError({
													message: "Failed to create WorkOS membership",
													detail: String(error),
												}),
										),
									)
							}

							// Add user to the default "general" channel
							const generalChannel = yield* channelRepo.findByOrgAndName(org.id, "general")

							if (Option.isSome(generalChannel)) {
								yield* channelMemberRepo.insert({
									channelId: generalChannel.value.id,
									userId: currentUser.id,
									isHidden: false,
									isMuted: false,
									isFavorite: false,
									lastSeenMessageId: null,
									notificationCount: 0,
									joinedAt: new Date(),
									deletedAt: null,
								})
							}

							yield* channelAccessSync.syncUserInOrganization(currentUser.id, org.id)

							const txid = yield* generateTransactionId()

							return new OrganizationResponse({
								data: {
									...org,
									settings: org.settings as {
										readonly [x: string]: unknown
									} | null,
								},
								transactionId: txid,
							})
						}),
					)
					.pipe(withRemapDbErrors("Organization", "update")),

			"organization.getAdminPortalLink": ({ id, intent }) =>
				Effect.gen(function* () {
					// Policy check - only admins/owners can access admin portal
					yield* organizationPolicy.canUpdate(id)

					// Get the WorkOS organization by our local org ID
					const workosOrg = yield* workos
						.call((client) => client.organizations.getOrganizationByExternalId(id))
						.pipe(
							Effect.catchTag("WorkOSAuthError", () =>
								Effect.fail(
									new OrganizationNotFoundError({
										organizationId: id,
									}),
								),
							),
						)

					// Map intent string to WorkOS enum
					const intentMap = {
						sso: GeneratePortalLinkIntent.SSO,
						domain_verification: GeneratePortalLinkIntent.DomainVerification,
						dsync: GeneratePortalLinkIntent.DSync,
						audit_logs: GeneratePortalLinkIntent.AuditLogs,
						log_streams: GeneratePortalLinkIntent.LogStreams,
					} as const

					// Generate portal link
					const portalLink = yield* workos
						.call((client) =>
							client.portal.generateLink({
								organization: workosOrg.id,
								intent: intentMap[intent],
							}),
						)
						.pipe(
							Effect.mapError(
								(error) =>
									new InternalServerError({
										message: "Failed to generate admin portal link",
										detail: String(error.cause),
										cause: String(error),
									}),
							),
						)

					return { link: portalLink.link }
				}),

			"organization.listDomains": ({ id }) =>
				Effect.gen(function* () {
					// Policy check - only admins/owners can list domains
					yield* organizationPolicy.canUpdate(id)

					// Get the WorkOS organization by our local org ID
					const workosOrg = yield* workos
						.call((client) => client.organizations.getOrganizationByExternalId(id))
						.pipe(
							Effect.catchTag("WorkOSAuthError", () =>
								Effect.fail(
									new OrganizationNotFoundError({
										organizationId: id,
									}),
								),
							),
						)

					// The domains are included in the organization response
					return workosOrg.domains.map((d) => ({
						id: d.id,
						domain: d.domain,
						state: d.state as "pending" | "verified" | "failed" | "legacy_verified",
						verificationToken: d.verificationToken ?? null,
					}))
				}),

			"organization.addDomain": ({ id, domain }) =>
				Effect.gen(function* () {
					// Policy check - only admins/owners can add domains
					yield* organizationPolicy.canUpdate(id)

					// Get the WorkOS organization by our local org ID
					const workosOrg = yield* workos
						.call((client) => client.organizations.getOrganizationByExternalId(id))
						.pipe(
							Effect.catchTag("WorkOSAuthError", () =>
								Effect.fail(
									new OrganizationNotFoundError({
										organizationId: id,
									}),
								),
							),
						)

					// Create domain in WorkOS
					const newDomain = yield* workos
						.call((client) =>
							client.organizationDomains.create({
								domain,
								organizationId: workosOrg.id,
							}),
						)
						.pipe(
							Effect.mapError(
								(error) =>
									new InternalServerError({
										message: "Failed to add domain",
										detail: String(error.cause),
										cause: String(error),
									}),
							),
						)

					return {
						id: newDomain.id,
						domain: newDomain.domain,
						state: newDomain.state,
						verificationToken: newDomain.verificationToken ?? null,
					}
				}),

			"organization.removeDomain": ({ id, domainId }) =>
				Effect.gen(function* () {
					// Policy check - only admins/owners can remove domains
					yield* organizationPolicy.canUpdate(id)

					// Delete domain from WorkOS
					yield* workos
						.call((client) => client.organizationDomains.delete(domainId))
						.pipe(
							Effect.mapError(
								(error) =>
									new InternalServerError({
										message: "Failed to remove domain",
										detail: String(error.cause),
										cause: String(error),
									}),
							),
						)

					return { success: true }
				}),
		}
	}),
)
