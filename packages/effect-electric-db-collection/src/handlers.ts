import { Effect } from "effect"
import type { Txid } from "@tanstack/electric-db-collection"
import type {
  InsertMutationFnParams,
  UpdateMutationFnParams,
  DeleteMutationFnParams,
  UtilsRecord,
} from "@tanstack/db"
import type { Row } from "@electric-sql/client"
import {
  InsertError,
  UpdateError,
  DeleteError,
  MissingTxIdError,
} from "./errors"
import type {
  EffectInsertHandler,
  EffectUpdateHandler,
  EffectDeleteHandler,
} from "./types"

/**
 * Converts an Effect-based insert handler to a Promise-based handler
 * that can be used with the standard electric collection options
 */
export function convertInsertHandler<
  T extends Row<unknown>,
  TKey extends string | number,
  TUtils extends UtilsRecord,
  E = never,
>(
  handler: EffectInsertHandler<T, TKey, TUtils, E> | undefined
): ((params: InsertMutationFnParams<T, TKey, TUtils>) => Promise<{
  txid: Txid | Array<Txid>
}>) | undefined {
  if (!handler) return undefined

  return async (params: InsertMutationFnParams<T, TKey, TUtils>) => {
    const result = await Effect.runPromise(
      handler(params).pipe(
        Effect.catchAll((error: E | unknown) =>
          Effect.fail(
            new InsertError({
              message: `Insert operation failed`,
              data: params.transaction.mutations[0]?.modified,
              cause: error,
            })
          )
        )
      )
    )

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
>(
  handler: EffectUpdateHandler<T, TKey, TUtils, E> | undefined
): ((params: UpdateMutationFnParams<T, TKey, TUtils>) => Promise<{
  txid: Txid | Array<Txid>
}>) | undefined {
  if (!handler) return undefined

  return async (params: UpdateMutationFnParams<T, TKey, TUtils>) => {
    const result = await Effect.runPromise(
      handler(params).pipe(
        Effect.catchAll((error: E | unknown) =>
          Effect.fail(
            new UpdateError({
              message: `Update operation failed`,
              key: params.transaction.mutations[0]?.key,
              cause: error,
            })
          )
        )
      )
    )

    if (!result.txid) {
      throw new MissingTxIdError({
        message: `Update handler must return a txid`,
        operation: "update",
      })
    }

    return result
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
>(
  handler: EffectDeleteHandler<T, TKey, TUtils, E> | undefined
): ((params: DeleteMutationFnParams<T, TKey, TUtils>) => Promise<{
  txid: Txid | Array<Txid>
}>) | undefined {
  if (!handler) return undefined

  return async (params: DeleteMutationFnParams<T, TKey, TUtils>) => {
    const result = await Effect.runPromise(
      handler(params).pipe(
        Effect.catchAll((error: E | unknown) =>
          Effect.fail(
            new DeleteError({
              message: `Delete operation failed`,
              key: params.transaction.mutations[0]?.key,
              cause: error,
            })
          )
        )
      )
    )

    if (!result.txid) {
      throw new MissingTxIdError({
        message: `Delete handler must return a txid`,
        operation: "delete",
      })
    }

    return result
  }
}
