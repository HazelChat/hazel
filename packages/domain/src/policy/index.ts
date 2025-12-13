import { Effect } from "effect"
import * as CurrentUser from "../current-user"
import { UnauthorizedError } from "../errors"

export const TypeId: unique symbol = Symbol.for("Domain/Policy/AuthorizedActor")
export type TypeId = typeof TypeId

export interface AuthorizedActor<Entity extends string, Action extends string> extends CurrentUser.Schema {
	readonly [TypeId]: {
		readonly _Entity: Entity
		readonly _Action: Action
	}
}

export const authorizedActor = <Entity extends string = string, Action extends string = string>(
	user: typeof CurrentUser.Schema.Type,
): AuthorizedActor<Entity, Action> => user as AuthorizedActor<Entity, Action>

export const policy = <Entity extends string, Action extends string, E, R>(
	entity: Entity,
	action: Action,
	f: (actor: typeof CurrentUser.Schema.Type) => Effect.Effect<boolean, E, R>,
): Effect.Effect<AuthorizedActor<Entity, Action>, E | UnauthorizedError, R | CurrentUser.Context> =>
	Effect.flatMap(CurrentUser.Context, (actor) =>
		Effect.flatMap(f(actor), (can) =>
			can
				? Effect.succeed(authorizedActor(actor))
				: Effect.fail(
						new UnauthorizedError({
							message: `You can't ${action} this ${entity}`,
							detail: `You are not authorized to perform ${action} on ${entity} for ${actor.id}`,
						}),
					),
		),
	)

export const policyCompose =
	<Actor extends AuthorizedActor<any, any>, E, R>(that: Effect.Effect<Actor, E, R>) =>
	<Actor2 extends AuthorizedActor<any, any>, E2, R2>(
		self: Effect.Effect<Actor2, E2, R2>,
	): Effect.Effect<Actor | Actor2, E | UnauthorizedError, R | CurrentUser.Context> =>
		Effect.zipRight(self, that) as Effect.Effect<
			Actor | Actor2,
			E | UnauthorizedError,
			R | CurrentUser.Context
		>

export const policyUse =
	<Actor extends AuthorizedActor<any, any>, E, R>(policy: Effect.Effect<Actor, E, R>) =>
	<A, E2, R2>(effect: Effect.Effect<A, E2, R2>): Effect.Effect<A, E | E2, Exclude<R2, Actor> | R> =>
		policy.pipe(Effect.zipRight(effect)) as Effect.Effect<A, E | E2, Exclude<R2, Actor> | R>

export interface PolicyEffect<A, E, R, Requirement> extends Effect.Effect<A, E, R | Requirement> {
	_Requirement: Requirement
}

export type PolicyFn<Requirement> = <A, E, R_In>(
	eff: Effect.Effect<A, E, R_In>,
) => PolicyEffect<A, E, R_In, Requirement>

export const policyRequire =
	<Entity extends string, Action extends string>(
		_entity: Entity,
		_action: Action,
	): PolicyFn<AuthorizedActor<Entity, Action>> =>
	(effect) =>
		Effect.zipLeft(effect, Effect.annotateCurrentSpan("policy", `${_entity}:${_action}`)) as never

export const withSystemActor = <A, E, R>(
	effect: Effect.Effect<A, E, R>,
): Effect.Effect<A, E, Exclude<R, AuthorizedActor<any, any>>> =>
	effect as Effect.Effect<A, E, Exclude<R, AuthorizedActor<any, any>>>
