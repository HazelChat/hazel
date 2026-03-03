import { CurrentUser, InvalidBearerTokenError, InvalidJwtPayloadError, SessionLoadError } from "@hazel/domain"
import { User } from "@hazel/domain/models"
import type { OrganizationId, UserId } from "@hazel/schema"
import { Config, Effect, Layer, Option } from "effect"
import { createRemoteJWKSet, jwtVerify } from "jose"
import { WorkOSClient } from "../session/workos-client.ts"

/**
 * Interface for the user repository methods needed by backend auth.
 * This avoids circular dependencies by not depending on the full UserRepo.
 * The methods accept any context requirement.
 */
export interface UserRepoLike {
	findByExternalId: (externalId: string) => Effect.Effect<
		Option.Option<{
			id: UserId
			email: string
			firstName: string
			lastName: string
			avatarUrl: string | null
			isOnboarded: boolean
			timezone: string | null
			settings: User.UserSettings | null
		}>,
		{ _tag: "DatabaseError" },
		any
	>
	upsertByExternalId: (user: {
		externalId: string
		email: string
		firstName: string
		lastName: string
		avatarUrl: string | null
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
			avatarUrl: string | null
			isOnboarded: boolean
			timezone: string | null
			settings: User.UserSettings | null
		},
		{ _tag: "DatabaseError" },
		any
	>
	update: (data: {
		id: UserId
		firstName?: string
		lastName?: string
		avatarUrl?: string | null
	}) => Effect.Effect<
		{
			id: UserId
			email: string
			firstName: string
			lastName: string
			avatarUrl: string | null
			isOnboarded: boolean
			timezone: string | null
			settings: User.UserSettings | null
		},
		{ _tag: "DatabaseError" } | { _tag: "ParseError" },
		any
	>
}

/**
 * Backend authentication service.
 * Provides full authentication with user sync support.
 *
 * This is used by the backend HTTP API and WebSocket RPC handlers.
 */
export class BackendAuth extends Effect.Service<BackendAuth>()("@hazel/auth/BackendAuth", {
	accessors: true,
	dependencies: [WorkOSClient.Default],
	effect: Effect.gen(function* () {
		const workos = yield* WorkOSClient
		const clientId = yield* Config.string("WORKOS_CLIENT_ID").pipe(Effect.orDie)

		/**
		 * Normalize avatar URLs (treat empty/whitespace as missing).
		 */
		const normalizeAvatarUrl = (avatarUrl: string | null | undefined): string | null =>
			avatarUrl?.trim() ? avatarUrl : null

		/**
		 * Check if an avatar URL is a Vercel fallback avatar.
		 * These are placeholder avatars that should be replaced with real OAuth avatars.
		 */
		const isVercelFallbackAvatar = (avatarUrl: string | null | undefined): boolean =>
			typeof avatarUrl === "string" && avatarUrl.startsWith("https://avatar.vercel.sh/")

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
				)

				const user = yield* Option.match(userOption, {
					onNone: () =>
						userRepo
							.upsertByExternalId({
								externalId: workOsUserId,
								email: email,
								firstName: firstName || "",
								lastName: lastName || "",
								avatarUrl: normalizeAvatarUrl(avatarUrl),
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
							),
					onSome: (existingUser) =>
						Effect.gen(function* () {
							// If existing user has empty name fields, update from OAuth
							const needsNameUpdate =
								(!existingUser.firstName && firstName) || (!existingUser.lastName && lastName)

							const workosAvatarUrl = normalizeAvatarUrl(avatarUrl)
							const existingAvatarUrl = normalizeAvatarUrl(existingUser.avatarUrl)

							// If OAuth provides a real avatar and the user has no avatar (or a Vercel fallback), update it.
							// This preserves custom R2-uploaded avatars while fixing initial sync issues.
							const needsAvatarUpdate =
								workosAvatarUrl !== null &&
								(existingAvatarUrl === null || isVercelFallbackAvatar(existingAvatarUrl))

							// If the user still has a Vercel fallback avatar and WorkOS has no picture, clear it.
							const needsAvatarClear =
								workosAvatarUrl === null && isVercelFallbackAvatar(existingAvatarUrl)

							const avatarUrlUpdate = needsAvatarUpdate
								? workosAvatarUrl
								: needsAvatarClear
									? null
									: undefined

							if (needsNameUpdate || avatarUrlUpdate !== undefined) {
								const updated = yield* userRepo
									.update({
										id: existingUser.id,
										firstName: existingUser.firstName || firstName || "",
										lastName: existingUser.lastName || lastName || "",
										...(avatarUrlUpdate !== undefined
											? { avatarUrl: avatarUrlUpdate }
											: {}),
									})
									.pipe(
										Effect.catchTags({
											DatabaseError: (err) =>
												Effect.fail(
													new SessionLoadError({
														message: "Failed to update user with OAuth data",
														detail: String(err),
													}),
												),
											ParseError: (err) =>
												Effect.fail(
													new SessionLoadError({
														message: "Failed to parse user update response",
														detail: String(err),
													}),
												),
										}),
									)
								return updated
							}
							return existingUser
						}),
				})

				return user
			})

		/**
		 * Authenticate with a WorkOS bearer token (JWT).
		 * Verifies the JWT signature and syncs the user to the database.
		 */
		const authenticateWithBearer = (bearerToken: string, userRepo: UserRepoLike) =>
			Effect.gen(function* () {
				const jwks = createRemoteJWKSet(new URL(`https://api.workos.com/sso/jwks/${clientId}`))

				// WorkOS can issue tokens with either issuer format:
				// - SSO/OIDC flow: https://api.workos.com
				// - User Management flow: https://api.workos.com/user_management/${clientId}
				const verifyWithIssuer = (issuer: string) =>
					Effect.tryPromise({
						try: () => jwtVerify(bearerToken, jwks, { issuer }),
						catch: (error) =>
							new InvalidBearerTokenError({
								message: `JWT verification failed: ${error}`,
								detail: `Issuer: ${issuer}`,
							}),
					})

				const { payload } = yield* verifyWithIssuer("https://api.workos.com").pipe(
					Effect.orElse(() =>
						verifyWithIssuer(`https://api.workos.com/user_management/${clientId}`),
					),
				)

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

				// Resolve WorkOS org ID to internal UUID
				// The JWT contains org_id (WorkOS org ID like "org_01ABC123...")
				// We need to convert to internal UUID for frontend comparison
				const workosOrgId = payload.org_id as string | undefined
				let internalOrgId: OrganizationId | undefined = undefined

				if (workosOrgId) {
					internalOrgId = yield* workos.getOrganization(workosOrgId).pipe(
						Effect.map((org) => org.externalId as OrganizationId | undefined),
						Effect.catchTag("OrganizationFetchError", (error) =>
							// Log warning but don't fail - org is optional context
							Effect.logWarning("Failed to resolve org ID from JWT", {
								workosOrgId,
								error: error.message,
							}).pipe(Effect.as(undefined)),
						),
					)
				}

				// Build CurrentUser from JWT payload and DB user
				const currentUser = new CurrentUser.Schema({
					id: user.id,
					role: (payload.role as "admin" | "member" | "owner") || "member",
					organizationId: internalOrgId,
					avatarUrl: user.avatarUrl ?? undefined,
					firstName: user.firstName,
					lastName: user.lastName,
					email: user.email,
					isOnboarded: user.isOnboarded,
					timezone: user.timezone,
					settings: user.settings,
				})

				return currentUser
			})

		return {
			authenticateWithBearer,
			syncUserFromWorkOS,
		}
	}),
}) {
	/** Mock user ID - a valid UUID */
	static readonly mockUserId = "00000000-0000-0000-0000-000000000001" as UserId

	/** Default mock user for tests */
	static mockUser = () => ({
		id: BackendAuth.mockUserId,
		email: "test@example.com",
		firstName: "Test",
		lastName: "User",
		avatarUrl: null,
		isOnboarded: true,
		timezone: "UTC" as string | null,
		settings: null as User.UserSettings | null,
	})

	/** Default mock CurrentUser for tests */
	static mockCurrentUser = () =>
		new CurrentUser.Schema({
			id: BackendAuth.mockUserId,
			role: "member",
			organizationId: undefined,
			avatarUrl: undefined,
			firstName: "Test",
			lastName: "User",
			email: "test@example.com",
			isOnboarded: true,
			timezone: "UTC",
			settings: null,
		})

	/** Test layer with successful authentication */
	static Test = Layer.mock(this, {
		_tag: "@hazel/auth/BackendAuth",
		authenticateWithBearer: (_bearerToken: string, _userRepo: UserRepoLike) =>
			Effect.succeed(BackendAuth.mockCurrentUser()),
		syncUserFromWorkOS: (
			_userRepo: UserRepoLike,
			_workOsUserId: string,
			_email: string,
			_firstName: string | null,
			_lastName: string | null,
			_avatarUrl: string | null,
		) => Effect.succeed(BackendAuth.mockUser()),
	})

	/** Test layer factory for configurable authentication behavior */
	static TestWith = (options: {
		currentUser?: CurrentUser.Schema
		shouldFail?: {
			authenticateWithBearer?: Effect.Effect<never, any>
		}
	}) =>
		Layer.mock(BackendAuth, {
			_tag: "@hazel/auth/BackendAuth",
			authenticateWithBearer: (_bearerToken: string, _userRepo: UserRepoLike) =>
				options.shouldFail?.authenticateWithBearer ??
				Effect.succeed(options.currentUser ?? BackendAuth.mockCurrentUser()),
			syncUserFromWorkOS: (
				_userRepo: UserRepoLike,
				_workOsUserId: string,
				_email: string,
				_firstName: string | null,
				_lastName: string | null,
				_avatarUrl: string | null,
			) => Effect.succeed(BackendAuth.mockUser()),
		})
}

/**
 * Layer that provides BackendAuth with all its dependencies.
 *
 * With Effect.Service dependencies, BackendAuth.Default automatically includes:
 * - WorkOSClient.Default (which includes AuthConfig.Default)
 */
export const BackendAuthLive = BackendAuth.Default
