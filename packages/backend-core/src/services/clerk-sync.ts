import type { WebhookEvent } from "@clerk/backend"
import { ClerkUserId } from "@hazel/schema"
import { Effect, Layer, Option, Schema, ServiceMap } from "effect"
import { UserRepo } from "../repositories/user-repo"

/**
 * Clerk webhook event processor.
 *
 * Currently handles `user.*` events — orgs + memberships are handled through
 * the RPC handlers (which write both to our DB and Clerk) rather than webhooks.
 * Expand this when we need server-side propagation of dashboard-initiated changes.
 */
export class ClerkSync extends ServiceMap.Service<ClerkSync>()("ClerkSync", {
	make: Effect.gen(function* () {
		const userRepo = yield* UserRepo

		const decodeClerkUserId = Schema.decodeUnknownSync(ClerkUserId)

		const normalizeAvatarUrl = (avatarUrl: string | null | undefined): string | null =>
			avatarUrl?.trim() ? avatarUrl : null

		const handleUserUpsert = (
			data: WebhookEvent extends { data: infer D } ? Extract<D, { id: string }> : never,
		) =>
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

		/** Process a verified Clerk webhook event. Returns `{ success, error? }`. */
		const processWebhookEvent = (event: WebhookEvent) =>
			Effect.gen(function* () {
				yield* Effect.logInfo(`Processing Clerk webhook: ${event.type}`, {
					type: event.type,
				})

				switch (event.type) {
					case "user.created":
					case "user.updated":
						yield* handleUserUpsert(event.data as never)
						break
					case "user.deleted":
						yield* handleUserDeleted(event.data as { id?: string })
						break
					default:
						yield* Effect.logDebug(`Ignoring Clerk event type: ${event.type}`)
				}

				return { success: true as const }
			}).pipe(
				Effect.catch((err: unknown) =>
					Effect.succeed({
						success: false as const,
						error: err instanceof Error ? err.message : String(err),
					}),
				),
			)

		return { processWebhookEvent, handleUserUpsert, handleUserDeleted }
	}),
}) {
	static readonly layer = Layer.effect(this, this.make).pipe(Layer.provide(UserRepo.layer))
}
