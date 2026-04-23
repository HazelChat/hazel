import type { WebhookEvent } from "@clerk/backend"
import type { DatabaseError } from "@hazel/db"
import { ClerkUserId, type OrganizationId, type UserId } from "@hazel/schema"
import { Effect, Layer, Option, Schema, ServiceMap } from "effect"
import { OrganizationMemberRepo } from "../repositories/organization-member-repo"
import { OrganizationRepo } from "../repositories/organization-repo"
import { UserRepo } from "../repositories/user-repo"

/**
 * Signals that a webhook event changed an organization membership.
 * The route handler uses this to re-sync channel access (which lives in
 * `apps/backend` and isn't reachable from this package).
 */
export type MembershipChange = {
	readonly userId: UserId
	readonly organizationId: OrganizationId
}

/**
 * Clerk webhook event processor.
 *
 * Handles:
 * - `user.*`                    → upsert / soft-delete by Clerk user ID (externalId column).
 *                                  Email changes flow through `user.updated` (Clerk refires the
 *                                  whole user payload including `email_addresses`), so there's
 *                                  no separate email-sync case — the upsert picks the primary.
 * - `organization.*`            → upsert / soft-delete by slug (with Clerk org ID stashed in settings)
 * - `organizationMembership.*`  → maintain the org_members junction table
 */
export class ClerkSync extends ServiceMap.Service<ClerkSync>()("ClerkSync", {
	make: Effect.gen(function* () {
		const userRepo = yield* UserRepo
		const orgRepo = yield* OrganizationRepo
		const membershipRepo = yield* OrganizationMemberRepo

		const decodeClerkUserId = Schema.decodeUnknownSync(ClerkUserId)

		const normalizeAvatarUrl = (avatarUrl: string | null | undefined): string | null =>
			avatarUrl?.trim() ? avatarUrl : null

		// --- Users ---

		const handleUserUpsert = (data: unknown) =>
			Effect.gen(function* () {
				const anyData = data as {
					id: string
					email_addresses?: Array<{ email_address: string; id: string }>
					primary_email_address_id?: string | null
					first_name?: string | null
					last_name?: string | null
					image_url?: string | null
				}

				const primaryEmail =
					anyData.email_addresses?.find((e) => e.id === anyData.primary_email_address_id)
						?.email_address ?? anyData.email_addresses?.[0]?.email_address
				if (!primaryEmail) {
					yield* Effect.logWarning(`Clerk user ${anyData.id} has no email — skipping upsert`)
					return
				}

				const existing = yield* userRepo
					.findByExternalId(anyData.id)
					.pipe(Effect.map(Option.getOrNull))

				const firstName = existing
					? anyData.first_name || existing.firstName
					: anyData.first_name || ""
				const lastName = existing
					? anyData.last_name || existing.lastName
					: anyData.last_name || ""

				yield* userRepo.upsertClerkUser({
					externalId: decodeClerkUserId(anyData.id),
					email: primaryEmail,
					firstName,
					lastName,
					avatarUrl: normalizeAvatarUrl(anyData.image_url),
					userType: "user",
					settings: null,
					isOnboarded: existing?.isOnboarded ?? false,
					timezone: existing?.timezone ?? null,
					deletedAt: null,
				})
			}).pipe(Effect.asVoid)

		const handleUserDeleted = (data: { id?: string }) =>
			Effect.gen(function* () {
				if (!data.id) return
				yield* userRepo.softDeleteByClerkUserId(decodeClerkUserId(data.id))
			}).pipe(Effect.asVoid)

		// --- Organizations ---

		const handleOrgUpsert = (data: unknown) =>
			Effect.gen(function* () {
				const anyData = data as {
					id: string
					name: string
					slug: string | null
					image_url?: string | null
				}
				if (!anyData.slug) {
					yield* Effect.logWarning(`Clerk org ${anyData.id} has no slug — skipping`)
					return
				}

				// Look up by slug first (primary key in our URL routing).
				const existing = yield* orgRepo
					.findBySlug(anyData.slug)
					.pipe(Effect.map(Option.getOrNull))

				if (existing) {
					yield* orgRepo.update({
						id: existing.id,
						name: anyData.name,
						logoUrl: anyData.image_url ?? existing.logoUrl,
					})
					return
				}

				yield* orgRepo.insert({
					name: anyData.name,
					slug: anyData.slug,
					logoUrl: anyData.image_url ?? null,
					isPublic: false,
					// Store the Clerk org ID in settings so we can correlate later.
					settings: { clerkOrganizationId: anyData.id },
					deletedAt: null,
				})
			}).pipe(Effect.asVoid)

		const handleOrgDeleted = (data: unknown) =>
			Effect.gen(function* () {
				const anyData = data as { id?: string; slug?: string | null }
				if (!anyData.slug) return
				const existing = yield* orgRepo.findBySlug(anyData.slug)
				if (Option.isNone(existing)) return
				yield* orgRepo.deleteById(existing.value.id)
			}).pipe(Effect.asVoid)

		// --- Organization memberships ---

		const roleFromClerk = (role: string | undefined | null): "admin" | "member" | "owner" => {
			if (role === "org:admin" || role === "admin") return "admin"
			return "member"
		}

		const handleMembershipUpsert = (
			data: unknown,
		): Effect.Effect<Option.Option<MembershipChange>, DatabaseError> =>
			Effect.gen(function* () {
				const anyData = data as {
					public_user_data?: { user_id?: string }
					organization?: { id?: string; slug?: string | null }
					role?: string | null
				}
				const clerkUserId = anyData.public_user_data?.user_id
				const orgSlug = anyData.organization?.slug
				if (!clerkUserId || !orgSlug) return Option.none()

				const userOpt = yield* userRepo
					.findByExternalId(clerkUserId)
					.pipe(Effect.map(Option.getOrNull))
				const orgOpt = yield* orgRepo
					.findBySlug(orgSlug)
					.pipe(Effect.map(Option.getOrNull))
				if (!userOpt || !orgOpt) {
					yield* Effect.logWarning(
						`Skipping membership upsert — user or org not found (user=${clerkUserId}, org=${orgSlug})`,
					)
					return Option.none()
				}

				yield* membershipRepo.upsertByOrgAndUser({
					organizationId: orgOpt.id,
					userId: userOpt.id,
					role: roleFromClerk(anyData.role),
					nickname: undefined,
					joinedAt: new Date(),
					invitedBy: null,
					deletedAt: null,
				})

				return Option.some({ userId: userOpt.id, organizationId: orgOpt.id })
			})

		const handleMembershipRemoved = (
			data: unknown,
		): Effect.Effect<Option.Option<MembershipChange>, DatabaseError> =>
			Effect.gen(function* () {
				const anyData = data as {
					public_user_data?: { user_id?: string }
					organization?: { slug?: string | null }
				}
				const clerkUserId = anyData.public_user_data?.user_id
				const orgSlug = anyData.organization?.slug
				if (!clerkUserId || !orgSlug) return Option.none()

				const userOpt = yield* userRepo
					.findByExternalId(clerkUserId)
					.pipe(Effect.map(Option.getOrNull))
				const orgOpt = yield* orgRepo
					.findBySlug(orgSlug)
					.pipe(Effect.map(Option.getOrNull))
				if (!userOpt || !orgOpt) return Option.none()

				yield* membershipRepo.softDeleteByOrgAndUser(orgOpt.id, userOpt.id)

				return Option.some({ userId: userOpt.id, organizationId: orgOpt.id })
			})

		/**
		 * Process a verified Clerk webhook event. Returns `{ success, error?, membershipChange? }`.
		 * When membership events are processed, `membershipChange` carries the affected Hazel
		 * user + org IDs so the caller can re-sync channel access (which lives outside this package).
		 */
		const processWebhookEvent = (event: WebhookEvent) =>
			Effect.gen(function* () {
				yield* Effect.logInfo(`Processing Clerk webhook: ${event.type}`, {
					type: event.type,
				})

				let membershipChange: MembershipChange | undefined
				let membershipRemoved = false

				switch (event.type) {
					case "user.created":
					case "user.updated":
						yield* handleUserUpsert(event.data)
						break
					case "user.deleted":
						yield* handleUserDeleted(event.data as { id?: string })
						break
					case "organization.created":
					case "organization.updated":
						yield* handleOrgUpsert(event.data)
						break
					case "organization.deleted":
						yield* handleOrgDeleted(event.data)
						break
					case "organizationMembership.created":
					case "organizationMembership.updated": {
						const result = yield* handleMembershipUpsert(event.data)
						if (Option.isSome(result)) membershipChange = result.value
						break
					}
					case "organizationMembership.deleted": {
						const result = yield* handleMembershipRemoved(event.data)
						if (Option.isSome(result)) {
							membershipChange = result.value
							membershipRemoved = true
						}
						break
					}
					default:
						yield* Effect.logDebug(`Ignoring Clerk event type: ${event.type}`)
				}

				return {
					success: true as const,
					membershipChange,
					membershipRemoved,
				}
			}).pipe(
				Effect.catch((err: unknown) =>
					Effect.succeed({
						success: false as const,
						error: err instanceof Error ? err.message : String(err),
					}),
				),
			)

		return {
			processWebhookEvent,
			handleUserUpsert,
			handleUserDeleted,
			handleOrgUpsert,
			handleOrgDeleted,
			handleMembershipUpsert,
			handleMembershipRemoved,
		}
	}),
}) {
	static readonly layer = Layer.effect(this, this.make).pipe(
		Layer.provide(UserRepo.layer),
		Layer.provide(OrganizationRepo.layer),
		Layer.provide(OrganizationMemberRepo.layer),
	)
}
