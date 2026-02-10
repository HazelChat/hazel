import { CurrentUser } from "@hazel/domain"
import type { OrganizationId, UserId } from "@hazel/schema"
import { Effect, Layer } from "effect"

export const TEST_ORG_ID = "00000000-0000-0000-0000-000000000001" as OrganizationId
export const TEST_ALT_ORG_ID = "00000000-0000-0000-0000-000000000002" as OrganizationId
export const TEST_USER_ID = "00000000-0000-0000-0000-000000000101" as UserId
export const TEST_ALT_USER_ID = "00000000-0000-0000-0000-000000000102" as UserId

export const makeActor = (overrides?: Partial<CurrentUser.Schema>): CurrentUser.Schema => ({
	id: TEST_USER_ID,
	email: "policy-test@example.com",
	firstName: "Policy",
	lastName: "Tester",
	role: "member",
	isOnboarded: true,
	timezone: "UTC",
	organizationId: TEST_ORG_ID,
	settings: null,
	...overrides,
})

export const runWithActorEither = <A, E, R>(
	effect: Effect.Effect<A, E, R>,
	layer: Layer.Layer<any, any, never>,
	actor: CurrentUser.Schema = makeActor(),
) =>
	Effect.runPromise(
		effect.pipe(Effect.provide(layer), Effect.provideService(CurrentUser.Context, actor), Effect.either),
	)

export const makeEntityNotFound = (entity = "Entity") =>
	({
		_tag: "EntityNotFound",
		entity,
	}) as const
