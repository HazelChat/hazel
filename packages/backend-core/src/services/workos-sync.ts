import { Database, schema } from "@hazel/db"
import { type OrganizationId, type UserId, withSystemActor } from "@hazel/domain"
import type { Event } from "@workos-inc/node"
import { Effect, Match, Option, pipe, Schema, Stream } from "effect"
import { InvitationRepo } from "../repositories/invitation-repo"
import { OrganizationMemberRepo } from "../repositories/organization-member-repo"
import { OrganizationRepo } from "../repositories/organization-repo"
import { UserRepo } from "../repositories/user-repo"
import { WorkOS } from "./workos"

// Error types
export class WorkOSSyncError extends Schema.TaggedError<WorkOSSyncError>("WorkOSSyncError")(
	"WorkOSSyncError",
	{
		message: Schema.String,
		cause: Schema.optional(Schema.Unknown),
	},
) {}

// Sync result types
export interface SyncResult {
	created: number
	updated: number
	deleted: number
	errors: string[]
}

export interface FullSyncResult {
	users: SyncResult
	organizations: SyncResult
	memberships: SyncResult
	invitations: SyncResult
	totalErrors: number
	startTime: number
	endTime: number
}

export class WorkOSSync extends Effect.Service<WorkOSSync>()("WorkOSSync", {
	accessors: true,
	effect: Effect.gen(function* () {
		const workos = yield* WorkOS
		const db = yield* Database.Database
		const userRepo = yield* UserRepo
		const orgRepo = yield* OrganizationRepo
		const orgMemberRepo = yield* OrganizationMemberRepo
		const invitationRepo = yield* InvitationRepo

		// Helper to convert an Effect to an Either and accumulate results
		const collectResult = <A>(
			effect: Effect.Effect<A, unknown>,
			onSuccess: (a: A) => void,
			onError: (error: unknown) => void,
		) =>
			pipe(
				effect,
				Effect.either,
				// biome-ignore lint/suspicious/useIterableCallbackReturn: <explanation>
				Effect.map((either) => {
					if (either._tag === "Right") {
						onSuccess(either.right)
					} else {
						onError(either.left)
					}
				}),
			)

		// Pagination helpers using Effect Stream to fetch all pages from WorkOS
		// Stream.paginateEffect takes initial cursor and returns Effect<[pageData, Option<nextCursor>]>
		// Stream.runCollect gathers all pages, then we flatten them into a single array

		const fetchAllUsers = pipe(
			Stream.paginateEffect(undefined as string | undefined, (after) =>
				workos
					.call((client) => client.userManagement.listUsers({ limit: 100, after }))
					.pipe(
						Effect.map(
							(response) =>
								[response.data, Option.fromNullable(response.listMetadata?.after)] as const,
						),
					),
			),
			Stream.runCollect,
			Effect.map((chunks) => [...chunks].flat()),
			Effect.withSpan("WorkOSSync.fetchAllUsers"),
		)

		const fetchAllOrganizations = pipe(
			Stream.paginateEffect(undefined as string | undefined, (after) =>
				workos
					.call((client) => client.organizations.listOrganizations({ limit: 100, after }))
					.pipe(
						Effect.map(
							(response) =>
								[response.data, Option.fromNullable(response.listMetadata?.after)] as const,
						),
					),
			),
			Stream.runCollect,
			Effect.map((chunks) => [...chunks].flat()),
			Effect.withSpan("WorkOSSync.fetchAllOrganizations"),
		)

		const fetchAllMemberships = (workosOrgId: string) =>
			pipe(
				Stream.paginateEffect(undefined as string | undefined, (after) =>
					workos
						.call((client) =>
							client.userManagement.listOrganizationMemberships({
								organizationId: workosOrgId,
								limit: 100,
								after,
							}),
						)
						.pipe(
							Effect.map(
								(response) =>
									[
										response.data,
										Option.fromNullable(response.listMetadata?.after),
									] as const,
							),
						),
				),
				Stream.runCollect,
				Effect.map((chunks) => [...chunks].flat()),
				Effect.withSpan("WorkOSSync.fetchAllMemberships", {
					attributes: { "workos.org.id": workosOrgId },
				}),
			)

		const fetchAllInvitations = (workosOrgId: string) =>
			pipe(
				Stream.paginateEffect(undefined as string | undefined, (after) =>
					workos
						.call((client) =>
							client.userManagement.listInvitations({
								organizationId: workosOrgId,
								limit: 100,
								after,
							}),
						)
						.pipe(
							Effect.map(
								(response) =>
									[
										response.data,
										Option.fromNullable(response.listMetadata?.after),
									] as const,
							),
						),
				),
				Stream.runCollect,
				Effect.map((chunks) => [...chunks].flat()),
				Effect.withSpan("WorkOSSync.fetchAllInvitations", {
					attributes: { "workos.org.id": workosOrgId },
				}),
			)

		// Sync all users from WorkOS
		const syncUsers = Effect.gen(function* () {
			const result: SyncResult = { created: 0, updated: 0, deleted: 0, errors: [] }

			// Fetch all users from WorkOS (with pagination)
			yield* Effect.logInfo("Fetching users from WorkOS...")
			const fetchStart = Date.now()
			const workosUsersResult = yield* pipe(fetchAllUsers, Effect.either)

			if (workosUsersResult._tag === "Left") {
				result.errors.push(`Failed to fetch users from WorkOS: ${workosUsersResult.left}`)
				return result
			}

			const workosUsers = workosUsersResult.right
			yield* Effect.logInfo(
				`Fetched ${workosUsers.length} users from WorkOS in ${Date.now() - fetchStart}ms`,
			)

			// Get all existing users
			const existingUsers = yield* userRepo.findAllActive()
			const existingUserMap = new Map(existingUsers.map((u) => [u.externalId, u]))
			const workosUserIds = new Set(workosUsers.map((u) => u.id))

			// Upsert users from WorkOS
			yield* Effect.logInfo(`Upserting ${workosUsers.length} users...`)
			const upsertStart = Date.now()
			yield* Effect.all(
				workosUsers.map((workosUser) =>
					collectResult(
						userRepo
							.upsertByExternalId({
								externalId: workosUser.id,
								email: workosUser.email,
								firstName: workosUser.firstName || "",
								lastName: workosUser.lastName || "",
								avatarUrl:
									workosUser.profilePictureUrl ||
									`https://avatar.vercel.sh/${workosUser.id}.svg`,
								userType: "user",
								settings: null,
								isOnboarded: false,
								timezone: null,
								deletedAt: null,
							})
							.pipe(withSystemActor),
						() => {
							if (existingUserMap.has(workosUser.id)) {
								result.updated++
							} else {
								result.created++
							}
						},
						(error) => {
							result.errors.push(`Error syncing user ${workosUser.id}: ${error}`)
						},
					),
				),
				{ concurrency: "unbounded" },
			)
			yield* Effect.logInfo(
				`Upserted users in ${Date.now() - upsertStart}ms: created=${result.created}, updated=${result.updated}, errors=${result.errors.length}`,
			)

			// DISABLED: Soft delete users that no longer exist in WorkOS
			// Skip mock users and machine/bot users (they're not managed by WorkOS)
			const usersToDelete = existingUsers.filter(
				(user) =>
					!workosUserIds.has(user.externalId) &&
					!user.externalId.startsWith("mock_") &&
					user.userType !== "machine",
			)
			if (usersToDelete.length > 0) {
				yield* Effect.logWarning(
					`[syncUsers] Would delete ${usersToDelete.length} users: ${usersToDelete.map((u) => u.externalId).join(", ")}`,
				)
			}

			return result
		}).pipe(Effect.withSpan("WorkOSSync.syncUsers"))

		// Sync all organizations from WorkOS
		const syncOrganizations = Effect.gen(function* () {
			const result: SyncResult = { created: 0, updated: 0, deleted: 0, errors: [] }

			// Fetch all organizations from WorkOS (with pagination)
			yield* Effect.logInfo("Fetching organizations from WorkOS...")
			const fetchStart = Date.now()
			const workosOrgsResult = yield* pipe(fetchAllOrganizations, Effect.either)

			if (workosOrgsResult._tag === "Left") {
				result.errors.push(`Failed to fetch organizations from WorkOS: ${workosOrgsResult.left}`)
				return result
			}

			const workosOrgs = workosOrgsResult.right
			yield* Effect.logInfo(
				`Fetched ${workosOrgs.length} organizations from WorkOS in ${Date.now() - fetchStart}ms`,
			)

			// Get all existing organizations
			const existingOrgs = yield* orgRepo.findAllActive()
			const existingOrgMap = new Map(existingOrgs.map((o) => [o.id, o]))
			const workosOrgExternalIds = new Set(
				workosOrgs.map((o) => o.externalId).filter((id): id is string => !!id),
			)

			// Upsert organizations from WorkOS
			yield* Effect.logInfo(`Upserting ${workosOrgs.length} organizations...`)
			const upsertStart = Date.now()
			yield* Effect.all(
				workosOrgs.map((workosOrg) =>
					collectResult(
						Effect.gen(function* () {
							// Only sync organizations that have an externalId (created through our API)
							if (!workosOrg.externalId) {
								// Skip organizations created directly in WorkOS without going through our API
								return
							}

							const orgId = workosOrg.externalId as OrganizationId
							const existingOrg = existingOrgMap.get(orgId)

							if (existingOrg) {
								// Update existing organization
								yield* orgRepo
									.update({
										id: orgId,
										name: workosOrg.name,
									})
									.pipe(withSystemActor)
								result.updated++
							} else {
								// Create new organization (edge case: org exists in WorkOS but not in our DB)
								// Use direct Drizzle insert to manually set the ID to match WorkOS externalId
								yield* db.execute((client) =>
									client.insert(schema.organizationsTable).values({
										id: orgId,
										name: workosOrg.name,
										slug: null,
										logoUrl: null,
										settings: null,
										deletedAt: null,
										createdAt: new Date(),
										updatedAt: new Date(),
									}),
								)
								result.created++
							}
						}),
						() => {}, // Success already handled in the effect
						(error) => {
							result.errors.push(`Error syncing org ${workosOrg.id}: ${error}`)
						},
					),
				),
				{ concurrency: "unbounded" },
			)
			yield* Effect.logInfo(
				`Upserted organizations in ${Date.now() - upsertStart}ms: created=${result.created}, updated=${result.updated}, errors=${result.errors.length}`,
			)

			// DISABLED: Soft delete organizations that no longer exist in WorkOS
			const orgsToDelete = existingOrgs.filter((org) => !workosOrgExternalIds.has(org.id))
			if (orgsToDelete.length > 0) {
				yield* Effect.logWarning(
					`[syncOrganizations] Would delete ${orgsToDelete.length} orgs: ${orgsToDelete.map((o) => `${o.id} (${o.name})`).join(", ")}`,
				)
			}

			return result
		}).pipe(Effect.withSpan("WorkOSSync.syncOrganizations"))

		// Sync organization memberships
		const syncOrganizationMemberships = Effect.fn("WorkOSSync.syncOrganizationMemberships")(function* (
			organizationId: OrganizationId,
		) {
			const result: SyncResult = { created: 0, updated: 0, deleted: 0, errors: [] }

			// Fetch WorkOS organization by our internal organization ID (stored as externalId in WorkOS)
			const workosOrgResult = yield* pipe(
				workos.call((client) => client.organizations.getOrganizationByExternalId(organizationId)),
				Effect.either,
			)

			if (workosOrgResult._tag === "Left") {
				result.errors.push(
					`Failed to fetch WorkOS org for ${organizationId}: ${workosOrgResult.left}`,
				)
				return result
			}

			const workosOrg = workosOrgResult.right

			// Fetch memberships from WorkOS using WorkOS organization ID (with pagination)
			const workosMembershipsResult = yield* pipe(fetchAllMemberships(workosOrg.id), Effect.either)

			if (workosMembershipsResult._tag === "Left") {
				result.errors.push(
					`Failed to fetch memberships for org ${organizationId}: ${workosMembershipsResult.left}`,
				)
				return result
			}

			const workosMemberships = workosMembershipsResult.right

			// Get all existing memberships for this org
			const existingMemberships = yield* orgMemberRepo.findAllByOrganization(organizationId)

			// Get all users to map external IDs to internal IDs
			const users = yield* userRepo.findAllActive()
			const userMap = new Map(users.map((u) => [u.externalId, u]))

			// Create a map of existing memberships by userId
			const existingMembershipMap = new Map(existingMemberships.map((m) => [m.userId, m]))

			// Track which memberships we've seen from WorkOS
			const seenUserIds = new Set<string>()

			// Upsert memberships from WorkOS
			yield* Effect.all(
				workosMemberships.map((workosMembership) => {
					const user = userMap.get(workosMembership.userId)
					if (!user) {
						result.errors.push(`User ${workosMembership.userId} not found for membership`)
						return Effect.succeed(undefined)
					}

					seenUserIds.add(user.id)
					const existing = existingMembershipMap.get(user.id)
					const role = (workosMembership.role?.slug || "member") as "admin" | "member" | "owner"

					return collectResult(
						orgMemberRepo
							.upsertByOrgAndUser({
								organizationId: organizationId,
								userId: user.id,
								role,
								nickname: undefined,
								joinedAt: new Date(),
								invitedBy: null,
								deletedAt: null,
							})
							.pipe(withSystemActor),
						() => {
							if (existing) {
								result.updated++
							} else {
								result.created++
							}
						},
						(error) => {
							result.errors.push(
								`Error syncing membership for user ${workosMembership.userId}: ${error}`,
							)
						},
					)
				}),
				{ concurrency: "unbounded" },
			)

			// DISABLED: Soft delete memberships that no longer exist in WorkOS
			// Skip mock users and machine/bot users (they're not managed by WorkOS)
			const membershipsToDelete = existingMemberships.filter((membership) => {
				const user = users.find((u) => u.id === membership.userId)
				return (
					!seenUserIds.has(membership.userId) &&
					!user?.externalId.startsWith("mock_") &&
					user?.userType !== "machine"
				)
			})
			if (membershipsToDelete.length > 0) {
				yield* Effect.logWarning(
					`[syncOrganizationMemberships] Would delete ${membershipsToDelete.length} memberships in org ${organizationId}: ${membershipsToDelete.map((m) => m.userId).join(", ")}`,
				)
			}

			return result
		})

		// Sync invitations
		const syncInvitations = Effect.fn("WorkOSSync.syncInvitations")(function* (
			organizationId: OrganizationId,
		) {
			const result: SyncResult & { expired: number } = {
				created: 0,
				updated: 0,
				deleted: 0,
				expired: 0,
				errors: [],
			}

			// Fetch WorkOS organization by our internal organization ID (stored as externalId in WorkOS)
			const workosOrgResult = yield* pipe(
				workos.call((client) => client.organizations.getOrganizationByExternalId(organizationId)),
				Effect.either,
			)

			if (workosOrgResult._tag === "Left") {
				result.errors.push(
					`Failed to fetch WorkOS org for ${organizationId}: ${workosOrgResult.left}`,
				)
				return result
			}

			const workosOrg = workosOrgResult.right

			// Fetch invitations from WorkOS using WorkOS organization ID (with pagination)
			const workosInvitationsResult = yield* pipe(fetchAllInvitations(workosOrg.id), Effect.either)

			if (workosInvitationsResult._tag === "Left") {
				result.errors.push(
					`Failed to fetch invitations for org ${organizationId}: ${workosInvitationsResult.left}`,
				)
				return result
			}

			const workosInvitations = workosInvitationsResult.right

			// Get all existing invitations for this org
			const existingInvitations = yield* invitationRepo.findAllByOrganization(organizationId)

			// Get all users to map external IDs to internal IDs
			const users = yield* userRepo.findAllActive()
			const userMap = new Map(users.map((u) => [u.externalId, u]))

			// Create a map of existing invitations by WorkOS ID
			const existingInvitationMap = new Map(
				existingInvitations.map((inv) => [inv.workosInvitationId, inv]),
			)

			// Upsert invitations from WorkOS
			yield* Effect.all(
				workosInvitations.map((workosInvitation) => {
					const existing = existingInvitationMap.get(workosInvitation.id)

					// Determine status based on WorkOS data
					let status: "pending" | "accepted" | "expired" | "revoked" = "pending"
					if (workosInvitation.state === "accepted") {
						status = "accepted"
					} else if (workosInvitation.state === "expired") {
						status = "expired"
					} else if (workosInvitation.state === "revoked") {
						status = "revoked"
					}

					// Find inviter user if available
					let invitedBy: UserId | null = null
					if (workosInvitation.inviterUserId) {
						const inviter = userMap.get(workosInvitation.inviterUserId)
						if (inviter) {
							invitedBy = inviter.id as UserId
						}
					}

					return collectResult(
						invitationRepo
							.upsertByWorkosId({
								workosInvitationId: workosInvitation.id,
								invitationUrl: workosInvitation.acceptInvitationUrl,
								organizationId: organizationId,
								email: workosInvitation.email,
								invitedBy: invitedBy,
								invitedAt: new Date(workosInvitation.createdAt),
								expiresAt: new Date(workosInvitation.expiresAt),
								status,
								acceptedAt: workosInvitation.acceptedAt
									? new Date(workosInvitation.acceptedAt)
									: null,
								acceptedBy: null,
							})
							.pipe(withSystemActor),
						() => {
							if (existing) {
								result.updated++
							} else {
								result.created++
							}
						},
						(error) => {
							result.errors.push(`Error syncing invitation ${workosInvitation.id}: ${error}`)
						},
					)
				}),
				{ concurrency: "unbounded" },
			)

			// Mark expired invitations
			const expiredResult = yield* pipe(invitationRepo.markExpired(), withSystemActor, Effect.either)

			if (expiredResult._tag === "Right") {
				result.expired = expiredResult.right.length
			} else {
				result.errors.push(`Error marking expired invitations: ${expiredResult.left}`)
			}

			return result
		})

		// Main sync orchestrator
		const syncAll = Effect.gen(function* () {
			const result: FullSyncResult = {
				users: { created: 0, updated: 0, deleted: 0, errors: [] },
				organizations: { created: 0, updated: 0, deleted: 0, errors: [] },
				memberships: { created: 0, updated: 0, deleted: 0, errors: [] },
				invitations: { created: 0, updated: 0, deleted: 0, errors: [] },
				totalErrors: 0,
				startTime: Date.now(),
				endTime: 0,
			}

			yield* Effect.logInfo("Starting WorkOS sync...")

			// Step 1: Sync all users
			result.users = yield* syncUsers

			// Step 2: Sync all organizations
			result.organizations = yield* syncOrganizations

			// Step 3: Sync memberships and invitations for each organization
			const organizations = yield* orgRepo.findAllActive()
			yield* Effect.logInfo(
				`Syncing memberships and invitations for ${organizations.length} organizations...`,
			)

			yield* Effect.all(
				organizations.map((org, index) =>
					Effect.gen(function* () {
						const orgStart = Date.now()
						yield* Effect.logInfo(
							`[${index + 1}/${organizations.length}] Syncing org ${org.name} (${org.id})...`,
						)

						const membershipResult = yield* syncOrganizationMemberships(org.id)
						result.memberships.created += membershipResult.created
						result.memberships.updated += membershipResult.updated
						result.memberships.deleted += membershipResult.deleted
						result.memberships.errors.push(...membershipResult.errors)

						const invitationResult = yield* syncInvitations(org.id as OrganizationId)
						result.invitations.created += invitationResult.created
						result.invitations.updated += invitationResult.updated
						result.invitations.deleted += invitationResult.deleted
						result.invitations.errors.push(...invitationResult.errors)

						yield* Effect.logInfo(
							`[${index + 1}/${organizations.length}] Completed org ${org.name} in ${Date.now() - orgStart}ms (memberships: +${membershipResult.created}/~${membershipResult.updated}, invitations: +${invitationResult.created}/~${invitationResult.updated})`,
						)
					}).pipe(
						Effect.withSpan("WorkOSSync.syncOrganization", {
							attributes: { "org.id": org.id, "org.name": org.name },
						}),
					),
				),
				{ concurrency: 5 },
			)

			// Calculate total errors
			result.totalErrors =
				result.users.errors.length +
				result.organizations.errors.length +
				result.memberships.errors.length +
				result.invitations.errors.length

			result.endTime = Date.now()
			const duration = (result.endTime - result.startTime) / 1000

			yield* Effect.logInfo(`WorkOS sync completed in ${duration}s with ${result.totalErrors} errors`)

			if (result.totalErrors > 0) {
				yield* Effect.logError("Sync errors:", {
					users: result.users.errors,
					organizations: result.organizations.errors,
					memberships: result.memberships.errors,
					invitations: result.invitations.errors,
				})
			}

			return result
		}).pipe(
			Effect.annotateLogs({ "sync.type": "workos", "sync.job": "full" }),
			Effect.withSpan("WorkOSSync.syncAll"),
		)

		// --- Webhook Event Handlers ---

		const handleUserUpsert = (data: {
			id: string
			email: string
			firstName: string | null
			lastName: string | null
			profilePictureUrl: string | null
		}) =>
			userRepo
				.upsertByExternalId({
					externalId: data.id,
					email: data.email,
					firstName: data.firstName || "",
					lastName: data.lastName || "",
					avatarUrl: data.profilePictureUrl || `https://avatar.vercel.sh/${data.id}.svg`,
					userType: "user",
					settings: null,
					isOnboarded: false,
					timezone: null,
					deletedAt: null,
				})
				.pipe(Effect.asVoid)

		const handleUserDeleted = (data: { id: string }) =>
			userRepo.softDeleteByExternalId(data.id).pipe(Effect.asVoid)

		const handleOrgUpsert = (data: { id: string; name: string; externalId: string | null }) =>
			Effect.gen(function* () {
				if (!data.externalId) {
					yield* Effect.logWarning(`Skipping organization ${data.id} - no externalId set`)
					return
				}

				const orgId = data.externalId as OrganizationId
				const existingOrg = yield* orgRepo.findById(orgId).pipe(withSystemActor)

				yield* Option.match(existingOrg, {
					onSome: (org) => orgRepo.update({ id: org.id, name: data.name }).pipe(withSystemActor),
					onNone: () =>
						orgRepo
							.insert({
								name: data.name,
								logoUrl: null,
								settings: null,
								deletedAt: null,
								slug: data.name
									.toLowerCase()
									.replace(/[^a-z0-9]+/g, "-")
									.replace(/^-|-$/g, ""),
							})
							.pipe(withSystemActor),
				})
			})

		const handleOrgDeleted = (data: { id: string; externalId: string | null }) =>
			Effect.gen(function* () {
				if (!data.externalId) {
					yield* Effect.logWarning(`Skipping organization deletion ${data.id} - no externalId set`)
					return
				}

				const orgId = data.externalId as OrganizationId
				yield* orgRepo.softDelete(orgId).pipe(withSystemActor)
			})

		const handleMembershipUpsert = (data: {
			organizationId: string
			userId: string
			role: { slug: string }
		}) =>
			Effect.gen(function* () {
				// Fetch WorkOS org to get externalId (our internal org ID)
				const workosOrgResult = yield* pipe(
					workos.call((client) => client.organizations.getOrganization(data.organizationId)),
					Effect.either,
				)

				if (workosOrgResult._tag === "Left") {
					yield* Effect.logError(`Failed to fetch WorkOS org ${data.organizationId}`)
					return
				}

				const workosOrg = workosOrgResult.right

				if (!workosOrg.externalId) {
					yield* Effect.logWarning(`WorkOS org ${data.organizationId} has no externalId`)
					return
				}

				const orgId = workosOrg.externalId as OrganizationId
				const org = yield* orgRepo.findById(orgId).pipe(withSystemActor)
				const user = yield* userRepo.findByExternalId(data.userId)

				if (Option.isSome(org) && Option.isSome(user)) {
					yield* orgMemberRepo.upsertByOrgAndUser({
						organizationId: org.value.id,
						nickname: null,
						userId: user.value.id,
						role: (data.role.slug || "member") as "admin" | "member" | "owner",
						joinedAt: new Date(),
						invitedBy: null,
						deletedAt: null,
					})
				}
			})

		const handleMembershipRemoved = (data: { organizationId: string; userId: string }) =>
			Effect.gen(function* () {
				// Fetch WorkOS org to get externalId (our internal org ID)
				const workosOrgResult = yield* pipe(
					workos.call((client) => client.organizations.getOrganization(data.organizationId)),
					Effect.either,
				)

				if (workosOrgResult._tag === "Left") {
					yield* Effect.logError(`Failed to fetch WorkOS org ${data.organizationId}`)
					return
				}

				const workosOrg = workosOrgResult.right

				if (!workosOrg.externalId) {
					yield* Effect.logWarning(`WorkOS org ${data.organizationId} has no externalId`)
					return
				}

				const orgId = workosOrg.externalId as OrganizationId
				const org = yield* orgRepo.findById(orgId).pipe(withSystemActor)
				const user = yield* userRepo.findByExternalId(data.userId)

				if (Option.isSome(org) && Option.isSome(user)) {
					yield* orgMemberRepo.softDeleteByOrgAndUser(org.value.id, user.value.id)
				}
			})

		// --- Process WorkOS webhook event using Match ---

		const processWebhookEvent = (event: Event) =>
			pipe(
				Effect.logDebug(`Processing WorkOS webhook: ${event.event}`),
				Effect.flatMap(() =>
					Match.value(event.event).pipe(
						Match.whenOr("user.created", "user.updated", () =>
							handleUserUpsert(event.data as Parameters<typeof handleUserUpsert>[0]),
						),
						Match.when("user.deleted", () =>
							handleUserDeleted(event.data as Parameters<typeof handleUserDeleted>[0]),
						),
						Match.whenOr("organization.created", "organization.updated", () =>
							handleOrgUpsert(event.data as Parameters<typeof handleOrgUpsert>[0]),
						),
						Match.when("organization.deleted", () =>
							handleOrgDeleted(event.data as Parameters<typeof handleOrgDeleted>[0]),
						),
						Match.whenOr("organization_membership.added", "organization_membership.updated", () =>
							handleMembershipUpsert(
								event.data as Parameters<typeof handleMembershipUpsert>[0],
							),
						),
						Match.when("organization_membership.removed", () =>
							handleMembershipRemoved(
								event.data as Parameters<typeof handleMembershipRemoved>[0],
							),
						),
						Match.orElse((eventType) =>
							Effect.logInfo(`Unhandled WorkOS event type: ${eventType}`),
						),
					),
				),
				Effect.tap(() => Effect.logDebug(`Successfully processed: ${event.event}`)),
				Effect.as({ success: true }),
				Effect.catchAll((error) =>
					Effect.logError(`Failed to process ${event.event}`, { error }).pipe(
						Effect.as({ success: false, error: String(error) }),
					),
				),
			)

		return {
			syncUsers: withSystemActor(syncUsers),
			syncOrganizations: withSystemActor(syncOrganizations),
			syncOrganizationMemberships: (orgId: OrganizationId) =>
				withSystemActor(syncOrganizationMemberships(orgId)),
			syncInvitations: (orgId: OrganizationId) => withSystemActor(syncInvitations(orgId)),
			syncAll: withSystemActor(syncAll),
			processWebhookEvent: (event: Event) => withSystemActor(processWebhookEvent(event)),
		}
	}),
	dependencies: [
		WorkOS.Default,
		UserRepo.Default,
		OrganizationRepo.Default,
		OrganizationMemberRepo.Default,
		InvitationRepo.Default,
	],
}) {}
