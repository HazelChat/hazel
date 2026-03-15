import { Effect } from "effect"
import * as CurrentUser from "./current-user"
import { UnauthorizedError } from "./errors"
import { PermissionError } from "./scopes/permission-error"

/**
 * Transform any error into an UnauthorizedError with context about the action.
 * Preserves existing UnauthorizedError instances.
 * Converts PermissionError into UnauthorizedError (for policy boundaries).
 * Uses the current user context to provide detailed error information.
 *
 * @param entity - The type of entity being accessed (e.g., "channel", "message")
 * @param action - The action being performed (e.g., "update", "delete")
 * @returns A function that transforms effect errors into UnauthorizedError
 *
 * @example
 * ```typescript
 * yield* someEffect.pipe(refailUnauthorized("channel", "update"))
 * ```
 */
export const refailUnauthorized = (entity: string, action: string) => {
	return <A, E, R>(
		effect: Effect.Effect<A, E, R>,
	): Effect.Effect<A, UnauthorizedError, CurrentUser.Context | R> =>
		Effect.catchIf(
			effect,
			(e) => !UnauthorizedError.is(e),
			(e) =>
				CurrentUser.Context.use((actor) => {
					// Convert PermissionError to UnauthorizedError with scope info
					if (PermissionError.is(e)) {
						return Effect.fail(
							new UnauthorizedError({
								message: (e as PermissionError).message,
								detail: `You are not authorized to perform ${action} on ${entity} for ${actor.id}`,
							}),
						)
					}
					return Effect.fail(
						new UnauthorizedError({
							message: `You can't ${action} this ${entity}`,
							detail: `You are not authorized to perform ${action} on ${entity} for ${actor.id}`,
						}),
					)
				}),
		) as Effect.Effect<A, UnauthorizedError, CurrentUser.Context | R>
}
