import { BackendAuth, ClerkClient, type UserRepoLike } from "@hazel/auth"
import {
	ClerkUserFetchError,
	CurrentUser,
	InvalidBearerTokenError,
	InvalidJwtPayloadError,
	WorkOSUserFetchError,
} from "@hazel/domain"
import { OrganizationMemberRepo, OrganizationRepo, UserRepo } from "@hazel/backend-core"
import { ServiceMap, Effect, Layer, Option } from "effect"

/**
 * Session management service that handles bearer-token authentication.
 *
 * During the WorkOS → Clerk migration this accepts tokens from either provider;
 * the issuer is sniffed from the JWT payload and routed accordingly.
 *
 * Additionally: lazily syncs a Clerk-signed-in user's organizations into our DB
 * on auth. This removes the hard webhook dependency for local development —
 * `bun run dev` doesn't need an ngrok tunnel pointing at /webhooks/clerk to
 * have orgs/memberships appear. Webhooks are still preferred in production for
 * instant propagation, but they're no longer required.
 */
export class SessionManager extends ServiceMap.Service<SessionManager>()("SessionManager", {
	make: Effect.gen(function* () {
		const auth = yield* BackendAuth
		const clerk = yield* ClerkClient
		const userRepo = yield* UserRepo
		const orgRepo = yield* OrganizationRepo
		const membershipRepo = yield* OrganizationMemberRepo

		const userRepoLike: UserRepoLike = {
			findByWorkOSUserId: userRepo.findByWorkOSUserId,
			findByExternalId: userRepo.findByExternalId,
			upsertWorkOSUser: userRepo.upsertWorkOSUser,
			upsertClerkUser: userRepo.upsertClerkUser,
			setExternalIdById: userRepo.setExternalIdById,
			update: userRepo.update,
		}

		// Per-process cache: Clerk user ID → last sync epoch-ms. Throttles repeated
		// sync calls when a single user fires many requests in quick succession.
		const orgSyncCache = new Map<string, number>()
		const SYNC_TTL_MS = 60_000

		const roleFromClerk = (role: string | undefined | null): "admin" | "member" | "owner" => {
			if (role === "org:admin" || role === "admin") return "admin"
			return "member"
		}

		/**
		 * Pull the user's org memberships from Clerk and upsert them into our DB.
		 * Fire-and-forget from the auth path; logs but never throws.
		 */
		const syncClerkOrgsForUser = (clerkUserId: string, localUserId: string) =>
			Effect.gen(function* () {
				const lastSync = orgSyncCache.get(clerkUserId) ?? 0
				if (Date.now() - lastSync < SYNC_TTL_MS) return
				orgSyncCache.set(clerkUserId, Date.now())

				const memberships = yield* Effect.tryPromise({
					try: () =>
						clerk.raw.users.getOrganizationMembershipList({
							userId: clerkUserId,
							limit: 100,
						}),
					catch: (err) => new Error(`clerk.getOrganizationMembershipList failed: ${err}`),
				})

				for (const m of memberships.data) {
					const org = m.organization
					if (!org.slug) continue

					// Upsert the org by slug. If it exists, no-op; otherwise insert with
					// the Clerk org ID stashed in settings so the webhook path can still
					// correlate it later.
					const existingOrg = yield* orgRepo
						.findBySlug(org.slug)
						.pipe(Effect.map(Option.getOrNull))

					const orgId = existingOrg
						? existingOrg.id
						: (yield* orgRepo
								.insert({
									name: org.name,
									slug: org.slug,
									logoUrl: org.imageUrl ?? null,
									isPublic: false,
									settings: { clerkOrganizationId: org.id },
									deletedAt: null,
								})
								.pipe(Effect.map((rows) => rows[0]!.id)))

					yield* membershipRepo.upsertByOrgAndUser({
						organizationId: orgId,
						userId: localUserId as any,
						role: roleFromClerk(m.role),
						nickname: undefined,
						joinedAt: new Date(),
						invitedBy: null,
						deletedAt: null,
					})
				}
			}).pipe(
				Effect.catch((err) => Effect.logWarning(`[session] Clerk org sync failed: ${err}`)),
			)

		/**
		 * Unified bearer-token authenticator. Routes to Clerk or WorkOS based on JWT issuer.
		 * For Clerk tokens, triggers a background org sync.
		 */
		const triggerLazySync = (currentUser: CurrentUser.Schema) =>
			Effect.gen(function* () {
				const externalId = yield* userRepo
					.findById(currentUser.id)
					.pipe(Effect.map((u) => Option.getOrNull(u)?.externalId))
				if (!externalId) return
				// Clerk user IDs are `user_<base58...>`; WorkOS ULIDs start with `user_01`.
				if (!externalId.startsWith("user_") || externalId.startsWith("user_01")) return
				yield* syncClerkOrgsForUser(externalId, currentUser.id)
			}).pipe(Effect.catch(() => Effect.void))

		const authenticateWithBearer = (bearerToken: string) =>
			Effect.gen(function* () {
				const currentUser = yield* auth.authenticate(bearerToken, userRepoLike)
				yield* triggerLazySync(currentUser)
				return currentUser
			})

		return {
			authenticateWithBearer: authenticateWithBearer as (
				bearerToken: string,
			) => Effect.Effect<
				CurrentUser.Schema,
				| InvalidBearerTokenError
				| InvalidJwtPayloadError
				| WorkOSUserFetchError
				| ClerkUserFetchError,
				never
			>,
		} as const
	}),
}) {
	static readonly layer = Layer.effect(this, this.make).pipe(
		Layer.provide(BackendAuth.layer),
		Layer.provide(ClerkClient.layer),
		Layer.provide(UserRepo.layer),
		Layer.provide(OrganizationRepo.layer),
		Layer.provide(OrganizationMemberRepo.layer),
	)
}
