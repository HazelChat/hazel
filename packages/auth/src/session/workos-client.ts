import { WorkOSUserFetchError } from "@hazel/domain"
import { WorkOSClientId, WorkOSOrganizationId, WorkOSUserId } from "@hazel/schema"
import type { Organization, User as WorkOSUser } from "@workos-inc/node"
import { OrganizationFetchError } from "../errors.ts"
import { WorkOS as WorkOSNodeAPI } from "@workos-inc/node"
import { ServiceMap, Effect, Layer, Schema } from "effect"
import { AuthConfig } from "../config.ts"

/**
 * WorkOS client wrapper with Effect integration.
 * Provides type-safe access to WorkOS SDK operations.
 */
export class WorkOSClient extends ServiceMap.Service<WorkOSClient>()("@hazel/auth/WorkOSClient", {
	make: Effect.gen(function* () {
		const config = yield* AuthConfig
		const client = new WorkOSNodeAPI(config.workosApiKey, {
			clientId: config.workosClientId,
		})

		const getUser = (userId: WorkOSUserId): Effect.Effect<WorkOSUser, WorkOSUserFetchError> =>
			Effect.tryPromise({
				try: () => client.userManagement.getUser(userId),
				catch: (error) =>
					new WorkOSUserFetchError({
						message: "Failed to fetch user from WorkOS",
						detail: String(error),
					}),
			}).pipe(
				Effect.tap(() => Effect.annotateCurrentSpan("user.found", true)),
				Effect.tapError(() => Effect.annotateCurrentSpan("user.found", false)),
				Effect.withSpan("WorkOSClient.getUser", { attributes: { "user.id": userId } }),
			)

		const getOrganization = (
			orgId: WorkOSOrganizationId,
		): Effect.Effect<Organization, OrganizationFetchError> =>
			Effect.tryPromise({
				try: () => client.organizations.getOrganization(orgId),
				catch: (error) =>
					new OrganizationFetchError({
						message: "Failed to fetch organization from WorkOS",
						detail: String(error),
					}),
			}).pipe(
				Effect.tap(() => Effect.annotateCurrentSpan("org.found", true)),
				Effect.tapError(() => Effect.annotateCurrentSpan("org.found", false)),
				Effect.withSpan("WorkOSClient.getOrganization", { attributes: { "org.id": orgId } }),
			)

		return {
			getUser,
			getOrganization,
			clientId: config.workosClientId,
		}
	}),
}) {
	static readonly layer = Layer.effect(this, this.make).pipe(
		Layer.provide(AuthConfig.layer),
	)

	/** Default mock user for tests */
	static readonly mockUser: WorkOSUser = {
		id: Schema.decodeUnknownSync(WorkOSUserId)("user_01ABC123"),
		email: "test@example.com",
		firstName: "Test",
		lastName: "User",
		profilePictureUrl: null,
		emailVerified: true,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		lastSignInAt: new Date().toISOString(),
		locale: "en",
		externalId: null,
		metadata: {},
		object: "user",
	}

	/** Default mock organization for tests */
	static readonly mockOrganization: Organization = {
		id: Schema.decodeUnknownSync(WorkOSOrganizationId)("org_01ABC123"),
		name: "Test Organization",
		externalId: "org_internal_123",
		allowProfilesOutsideOrganization: false,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		domains: [],
		metadata: {},
		object: "organization",
	}

	/** Test layer with mock WorkOS responses */
	static Test = Layer.mock(this, {
		_tag: "@hazel/auth/WorkOSClient",
		getUser: (userId: WorkOSUserId) => Effect.succeed({ ...WorkOSClient.mockUser, id: userId }),
		getOrganization: (orgId: WorkOSOrganizationId) =>
			Effect.succeed({ ...WorkOSClient.mockOrganization, id: orgId }),
		clientId: Schema.decodeUnknownSync(WorkOSClientId)("client_test_123"),
	})

	/** Test layer factory for configurable WorkOS behavior */
	static TestWith = (options: { user?: WorkOSUser; organization?: Organization }) =>
		Layer.mock(WorkOSClient, {
			_tag: "@hazel/auth/WorkOSClient",
			getUser: (userId: WorkOSUserId) =>
				Effect.succeed({ ...(options.user ?? WorkOSClient.mockUser), id: userId }),
			getOrganization: (orgId: WorkOSOrganizationId) =>
				Effect.succeed({ ...(options.organization ?? WorkOSClient.mockOrganization), id: orgId }),
			clientId: Schema.decodeUnknownSync(WorkOSClientId)("client_test_123"),
		})
}
