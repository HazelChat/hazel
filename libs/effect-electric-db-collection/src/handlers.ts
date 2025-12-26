import type { Row } from "@electric-sql/client"
import type {
	DeleteMutationFnParams,
	InsertMutationFnParams,
	UpdateMutationFnParams,
	UtilsRecord,
} from "@tanstack/db"
import type { Txid } from "@tanstack/electric-db-collection"
import { Effect, Exit, type ManagedRuntime } from "effect"
import { DeleteError, InsertError, MissingTxIdError, UpdateError } from "./errors"
import type { EffectDeleteHandler, EffectInsertHandler, EffectUpdateHandler } from "./types"

/**
 * Converts an Effect-based insert handler to a Promise-based handler
 * that can be used with the standard electric collection options
 */
export function convertInsertHandler<
	T extends Row<unknown>,
	TKey extends string | number,
	TUtils extends UtilsRecord,
	E = never,
	R = never,
>(
	handler: EffectInsertHandler<T, TKey, TUtils, E, R> | undefined,
	runtime?: ManagedRuntime.ManagedRuntime<R, any>,
):
	| ((params: InsertMutationFnParams<T, TKey, TUtils>) => Promise<{
			txid: Txid | Array<Txid>
	  }>)
	| undefined {
	if (!handler) return undefined

	return async (params: InsertMutationFnParams<T, TKey, TUtils>) => {
		const effect = handler(params).pipe(
			Effect.catchAll((error: E | unknown) =>
				Effect.fail(
					new InsertError({
						message: `Insert operation failed`,
						data: params.transaction.mutations[0]?.modified,
						cause: error,
					}),
				),
			),
		)

		const exit = runtime
			? await runtime.runPromiseExit(effect)
			: await Effect.runPromiseExit(
					effect as Effect.Effect<{ txid: Txid | Array<Txid> }, InsertError, never>,
				)

		// Handle the Exit type
		if (Exit.isFailure(exit)) {
			const cause = exit.cause
			if (cause._tag === "Fail") {
				throw cause.error
			}
			throw new InsertError({
				message: `Insert operation failed unexpectedly`,
				data: params.transaction.mutations[0]?.modified,
				cause: cause,
			})
		}

		const result = exit.value

		if (!result.txid) {
			throw new MissingTxIdError({
				message: `Insert handler must return a txid`,
				operation: "insert",
			})
		}

		return result
	}
}

/**
 * Converts an Effect-based update handler to a Promise-based handler
 * that can be used with the standard electric collection options
 */
export function convertUpdateHandler<
	T extends Row<unknown>,
	TKey extends string | number,
	TUtils extends UtilsRecord,
	E = never,
	R = never,
>(
	handler: EffectUpdateHandler<T, TKey, TUtils, E, R> | undefined,
	runtime?: ManagedRuntime.ManagedRuntime<R, any>,
):
	| ((params: UpdateMutationFnParams<T, TKey, TUtils>) => Promise<{
			txid: Txid | Array<Txid>
	  }>)
	| undefined {
	if (!handler) return undefined

	return async (params: UpdateMutationFnParams<T, TKey, TUtils>) => {
		console.log("[handlers.ts] convertUpdateHandler: Starting update handler")

		const effect = handler(params).pipe(
			Effect.tap(() => Effect.sync(() => console.log("[handlers.ts] Effect executed successfully"))),
			Effect.tapError((error: E | unknown) =>
				Effect.sync(() => console.error("[handlers.ts] Effect error before catchAll:", error)),
			),
			Effect.catchAll((error: E | unknown) =>
				Effect.fail(
					new UpdateError({
						message: `Update operation failed`,
						key: params.transaction.mutations[0]?.key,
						cause: error,
					}),
				),
			),
		)

		console.log("[handlers.ts] About to run effect with runtime:", !!runtime)

		try {
			const exit = runtime
				? await runtime.runPromiseExit(effect)
				: await Effect.runPromiseExit(
						effect as Effect.Effect<{ txid: Txid | Array<Txid> }, UpdateError, never>,
					)

			console.log("[handlers.ts] Effect exit:", exit)

			// Handle the Exit type
			if (Exit.isFailure(exit)) {
				const cause = exit.cause
				console.error("[handlers.ts] Effect failed with cause:", cause)
				if (cause._tag === "Fail") {
					throw cause.error
				}
				throw new UpdateError({
					message: `Update operation failed unexpectedly`,
					key: params.transaction.mutations[0]?.key,
					cause: cause,
				})
			}

			const result = exit.value
			console.log("[handlers.ts] Effect completed, result:", result)

			if (!result.txid) {
				throw new MissingTxIdError({
					message: `Update handler must return a txid`,
					operation: "update",
				})
			}

			return result
		} catch (error) {
			console.error("[handlers.ts] Error running effect:", error)
			throw error
		}
	}
}

/**
 * Converts an Effect-based delete handler to a Promise-based handler
 * that can be used with the standard electric collection options
 */
export function convertDeleteHandler<
	T extends Row<unknown>,
	TKey extends string | number,
	TUtils extends UtilsRecord,
	E = never,
	R = never,
>(
	handler: EffectDeleteHandler<T, TKey, TUtils, E, R> | undefined,
	runtime?: ManagedRuntime.ManagedRuntime<R, any>,
):
	| ((params: DeleteMutationFnParams<T, TKey, TUtils>) => Promise<{
			txid: Txid | Array<Txid>
	  }>)
	| undefined {
	if (!handler) return undefined

	return async (params: DeleteMutationFnParams<T, TKey, TUtils>) => {
		const effect = handler(params).pipe(
			Effect.catchAll((error: E | unknown) =>
				Effect.fail(
					new DeleteError({
						message: `Delete operation failed`,
						key: params.transaction.mutations[0]?.key,
						cause: error,
					}),
				),
			),
		)

		const exit = runtime
			? await runtime.runPromiseExit(effect)
			: await Effect.runPromiseExit(
					effect as Effect.Effect<{ txid: Txid | Array<Txid> }, DeleteError, never>,
				)

		// Handle the Exit type
		if (Exit.isFailure(exit)) {
			const cause = exit.cause
			if (cause._tag === "Fail") {
				throw cause.error
			}
			throw new DeleteError({
				message: `Delete operation failed unexpectedly`,
				key: params.transaction.mutations[0]?.key,
				cause: cause,
			})
		}

		const result = exit.value

		if (!result.txid) {
			throw new MissingTxIdError({
				message: `Delete handler must return a txid`,
				operation: "delete",
			})
		}

		return result
	}
}
