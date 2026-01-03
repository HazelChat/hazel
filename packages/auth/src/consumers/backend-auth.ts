import {
	CurrentUser,
	InvalidBearerTokenError,
	InvalidJwtPayloadError,
	type OrganizationId,
	SessionLoadError,
	withSystemActor,
	WorkOSUserFetchError,
} from "@hazel/domain"
import type { UserId } from "@hazel/schema"
import { Config, Effect, Layer, Option } from "effect"
import { createRemoteJWKSet, jwtVerify } from "jose"
import { SessionCache } from "../cache/session-cache.ts"
import { AuthConfig } from "../config.ts"
import type { BackendAuthResult } from "../types.ts"
import { SessionValidator } from "../session/session-validator.ts"
import { WorkOSClient } from "../session/workos-client.ts"

/**
 * Interface for the user repository methods needed by backend auth.
 * This avoids circular dependencies by not depending on the full UserRepo.
 * The methods accept any context requirement since we wrap them with withSystemActor.
 */
export interface UserRepoLike {
	findByExternalId: (externalId: string) => Effect.Effect<
		Option.Option<{
			id: UserId
			email: string
			firstName: string
			lastName: string
			avatarUrl: string
			isOnboarded: boolean
			timezone: string | null
		}>,
		{ _tag: "DatabaseError" },
		any
	>
	upsertByExternalId: (user: {
		externalId: string
		email: string
		firstName: string
		lastName: string
		avatarUrl: string
		userType: "user" | "machine"
		settings: null
		isOnboarded: boolean
		timezone: string | null
		deletedAt: null
	}) => Effect.Effect<
		{
			id: UserId
			email: string
			firstName: string
			lastName: string
			avatarUrl: string
			isOnboarded: boolean
			timezone: string | null
		},
		{ _tag: "DatabaseError" },
		any
	>
}

/**
 * Backend authentication service.
 * Provides full authentication with user sync and session refresh support.
 *
 * This is used by the backend HTTP API and WebSocket RPC handlers.
 */
export class BackendAuth extends Effect.Service<BackendAuth>()("@hazel/auth/BackendAuth", {
	accessors: true,
	dependencies: [SessionValidator.Default, WorkOSClient.Default],
	effect: Effect.gen(function* () {
		const validator = yield* SessionValidator
		const workos = yield* WorkOSClient
		const clientId = yield* Config.string("WORKOS_CLIENT_ID").pipe(Effect.orDie)

		/**
		 * Sync a WorkOS user to the database (find or create).
		 */
		const syncUserFromWorkOS = (
			userRepo: UserRepoLike,
			workOsUserId: string,
			email: string,
			firstName: string | null,
			lastName: string | null,
			avatarUrl: string | null,
		) =>
			Effect.gen(function* () {
				const userOption = yield* userRepo.findByExternalId(workOsUserId).pipe(
					Effect.catchTags({
						DatabaseError: (err) =>
							Effect.fail(
								new SessionLoadError({
									message: "Failed to query user by external ID",
									detail: String(err),
								}),
							),
					}),
					withSystemActor,
				)

				const user = yield* Option.match(userOption, {
					onNone: () =>
						userRepo
							.upsertByExternalId({
								externalId: workOsUserId,
								email: email,
								firstName: firstName || "",
								lastName: lastName || "",
								avatarUrl: avatarUrl || `https://avatar.vercel.sh/${workOsUserId}.svg`,
								userType: "user",
								settings: null,
								isOnboarded: false,
								timezone: null,
								deletedAt: null,
							})
							.pipe(
								Effect.catchTags({
									DatabaseError: (err) =>
										Effect.fail(
											new SessionLoadError({
												message: "Failed to create user",
												detail: String(err),
											}),
										),
								}),
								withSystemActor,
							),
					onSome: (user) => Effect.succeed(user),
				})

				return user
			})

		/**
		 * Authenticate with a WorkOS sealed session cookie.
		 * Returns the current user and optionally a new session cookie if refreshed.
		 */
		const authenticateWithCookie = (sessionCookie: string, userRepo: UserRepoLike) =>
			Effect.gen(function* () {
				// Validate and optionally refresh the session
				const { session, newSealedSession } = yield* validator.validateAndRefresh(sessionCookie)

				// Sync user to database (upsert)
				const user = yield* syncUserFromWorkOS(
					userRepo,
					session.workosUserId,
					session.email,
					session.firstName,
					session.lastName,
					session.profilePictureUrl,
				)

				// Build CurrentUser
				const currentUser = new CurrentUser.Schema({
					id: user.id,
					role: (session.role as "admin" | "member" | "owner") || "member",
					organizationId: session.internalOrganizationId as OrganizationId | undefined,
					avatarUrl: user.avatarUrl,
					firstName: user.firstName,
					lastName: user.lastName,
					email: user.email,
					isOnboarded: user.isOnboarded,
					timezone: user.timezone,
				})

				yield* Effect.logDebug("[Cookie Auth] Final CurrentUser", {
					id: currentUser.id,
					organizationId: currentUser.organizationId,
					role: currentUser.role,
				})

				return { currentUser, refreshedSession: newSealedSession } satisfies BackendAuthResult
			})

		/**
		 * Authenticate with a WorkOS bearer token (JWT).
		 * Verifies the JWT signature and syncs the user to the database.
		 */
		const authenticateWithBearer = (bearerToken: string, userRepo: UserRepoLike) =>
			Effect.gen(function* () {
				// Verify JWT signature using WorkOS JWKS
				const jwks = createRemoteJWKSet(new URL(`https://api.workos.com/sso/jwks/${clientId}`))

				const { payload } = yield* Effect.tryPromise({
					try: () =>
						jwtVerify(bearerToken, jwks, {
							issuer: "https://api.workos.com",
						}),
					catch: (error) =>
						new InvalidBearerTokenError({
							message: `Invalid token: ${error}`,
							detail: `The provided token is invalid`,
						}),
				})

				const workOsUserId = payload.sub
				if (!workOsUserId) {
					return yield* Effect.fail(
						new InvalidJwtPayloadError({
							message: "Token missing user ID",
							detail: "The provided token is missing the user ID",
						}),
					)
				}

				// Try to find user in DB, if not found fetch from WorkOS and create
				const userOption = yield* userRepo.findByExternalId(workOsUserId).pipe(
					Effect.catchTags({
						DatabaseError: (err) =>
							Effect.fail(
								new InvalidBearerTokenError({
									message: "Failed to query user",
									detail: String(err),
								}),
							),
					}),
					withSystemActor,
				)

				const user = yield* Option.match(userOption, {
					onNone: () =>
						Effect.gen(function* () {
							// Fetch user details from WorkOS
							const workosUser = yield* workos.getUser(workOsUserId)

							// Create user in DB
							return yield* syncUserFromWorkOS(
								userRepo,
								workosUser.id,
								workosUser.email,
								workosUser.firstName,
								workosUser.lastName,
								workosUser.profilePictureUrl,
							)
						}),
					onSome: (user) => Effect.succeed(user),
				})

				// Build CurrentUser from JWT payload and DB user
				const currentUser = new CurrentUser.Schema({
					id: user.id,
					role: (payload.role as "admin" | "member" | "owner") || "member",
					organizationId: payload.externalOrganizationId as OrganizationId | undefined,
					avatarUrl: user.avatarUrl,
					firstName: user.firstName,
					lastName: user.lastName,
					email: user.email,
					isOnboarded: user.isOnboarded,
					timezone: user.timezone,
				})

				return currentUser
			})

		return {
			authenticateWithCookie,
			authenticateWithBearer,
		}
	}),
}) {}

/**
 * Layer that provides BackendAuth with all its dependencies EXCEPT ResultPersistence.
 * ResultPersistence must be provided externally for session caching.
 *
 * With Effect.Service dependencies, BackendAuth.Default automatically includes:
 * - SessionValidator.Default (which includes WorkOSClient.Default + SessionCache.Default)
 * - WorkOSClient.Default (which includes AuthConfig.Default)
 *
 * The only remaining external dependency is ResultPersistence for SessionCache.
 *
 * Usage:
 * ```ts
 * BackendAuthLive.pipe(Layer.provide(RedisResultPersistenceLive))
 * ```
 */
export const BackendAuthLive = BackendAuth.Default
