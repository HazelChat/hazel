import { createClerkClient, type Organization, type User } from "@clerk/backend"
import { ClerkUserFetchError } from "@hazel/domain"
import { ClerkOrganizationId, ClerkUserId } from "@hazel/schema"
import { Effect, Layer, Context } from "effect"
import { OrganizationCreateError, OrganizationFetchError } from "../errors.ts"
import { AuthConfig } from "../config.ts"

/**
 * Clerk Backend SDK wrapper with Effect integration.
 * Provides type-safe access to Clerk Backend API operations.
 */
export class ClerkClient extends Context.Service<ClerkClient>()("@hazel/auth/ClerkClient", {
	make: Effect.gen(function* () {
		const config = yield* AuthConfig
		const client = createClerkClient({
			secretKey: config.clerkSecretKey,
			publishableKey: config.clerkPublishableKey,
		})

		const getUser = (userId: ClerkUserId): Effect.Effect<User, ClerkUserFetchError> =>
			Effect.tryPromise({
				try: () => client.users.getUser(userId),
				catch: (error) =>
					new ClerkUserFetchError({
						message: "Failed to fetch user from Clerk",
						detail: String(error),
					}),
			}).pipe(
				Effect.tap(() => Effect.annotateCurrentSpan("user.found", true)),
				Effect.tapError(() => Effect.annotateCurrentSpan("user.found", false)),
				Effect.withSpan("ClerkClient.getUser", { attributes: { "user.id": userId } }),
			)

		const getOrganization = (
			orgId: ClerkOrganizationId,
		): Effect.Effect<Organization, OrganizationFetchError> =>
			Effect.tryPromise({
				try: () => client.organizations.getOrganization({ organizationId: orgId }),
				catch: (error) =>
					new OrganizationFetchError({
						message: "Failed to fetch organization from Clerk",
						detail: String(error),
					}),
			}).pipe(
				Effect.tap(() => Effect.annotateCurrentSpan("org.found", true)),
				Effect.tapError(() => Effect.annotateCurrentSpan("org.found", false)),
				Effect.withSpan("ClerkClient.getOrganization", { attributes: { "org.id": orgId } }),
			)

		const createOrganization = (params: {
			name: string
			slug?: string | null
			/** Clerk user id of the creator — becomes the org admin and fires the membership webhook. */
			createdBy?: string
		}): Effect.Effect<Organization, OrganizationCreateError> =>
			Effect.tryPromise({
				try: () =>
					client.organizations.createOrganization({
						name: params.name,
						...(params.slug ? { slug: params.slug } : {}),
						...(params.createdBy ? { createdBy: params.createdBy } : {}),
					}),
				catch: (error) =>
					new OrganizationCreateError({
						message: "Failed to create organization in Clerk",
						detail: String(error),
					}),
			}).pipe(
				Effect.tap((org) => Effect.annotateCurrentSpan("org.id", org.id)),
				Effect.withSpan("ClerkClient.createOrganization", {
					attributes: { "org.slug": params.slug ?? undefined },
				}),
			)

		const deleteOrganization = (orgId: string): Effect.Effect<void, OrganizationCreateError> =>
			Effect.tryPromise({
				try: () => client.organizations.deleteOrganization(orgId),
				catch: (error) =>
					new OrganizationCreateError({
						message: "Failed to delete organization in Clerk",
						detail: String(error),
					}),
			}).pipe(
				Effect.asVoid,
				Effect.withSpan("ClerkClient.deleteOrganization", { attributes: { "org.id": orgId } }),
			)

		return {
			getUser,
			getOrganization,
			createOrganization,
			deleteOrganization,
			/** Raw SDK client for operations not yet wrapped (createUser, updateUser, webhooks, etc.). */
			raw: client,
		}
	}),
}) {
	static readonly layer = Layer.effect(this, this.make).pipe(Layer.provide(AuthConfig.layer))

	/** Test layer with mock Clerk responses */
	static Test = Layer.mock(this, {
		getUser: (userId: ClerkUserId) =>
			Effect.succeed({
				id: userId,
				emailAddresses: [{ emailAddress: "test@example.com" } as User["emailAddresses"][number]],
				firstName: "Test",
				lastName: "User",
			} as unknown as User),
		getOrganization: (orgId: ClerkOrganizationId) =>
			Effect.succeed({
				id: orgId,
				name: "Test Organization",
				slug: "test-organization",
			} as unknown as Organization),
		createOrganization: (params: { name: string; slug?: string | null; createdBy?: string }) =>
			Effect.succeed({
				id: "org_test",
				name: params.name,
				slug: params.slug ?? "test-organization",
			} as unknown as Organization),
		deleteOrganization: (_orgId: string) => Effect.void,
		raw: {} as ReturnType<typeof createClerkClient>,
	})
}
