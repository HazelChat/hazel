import { Effect } from "effect"
import { electricCollectionOptions } from "@tanstack/electric-db-collection"
import type { Txid, ElectricCollectionUtils } from "@tanstack/electric-db-collection"
import type { CollectionConfig } from "@tanstack/db"
import type { StandardSchemaV1 } from "@standard-schema/spec"
import type { Row } from "@electric-sql/client"
import {
  convertInsertHandler,
  convertUpdateHandler,
  convertDeleteHandler,
} from "./handlers"
import { TxIdTimeoutError, InvalidTxIdError } from "./errors"
import type { EffectElectricCollectionConfig } from "./types"

type InferSchemaOutput<T> = T extends StandardSchemaV1
  ? StandardSchemaV1.InferOutput<T> extends Row<unknown>
    ? StandardSchemaV1.InferOutput<T>
    : Record<string, unknown>
  : Record<string, unknown>

/**
 * Effect-based utilities for Electric collections
 */
export interface EffectElectricCollectionUtils extends ElectricCollectionUtils {
  /**
   * Wait for a specific transaction ID to be synced (Effect version)
   */
  readonly awaitTxIdEffect: (
    txid: Txid,
    timeout?: number
  ) => Effect.Effect<boolean, TxIdTimeoutError | InvalidTxIdError>
}

/**
 * Creates Electric collection options with Effect-based handlers
 *
 * This function converts Effect-based mutation handlers to Promise-based handlers
 * that are compatible with the standard electricCollectionOptions
 */
export function effectElectricCollectionOptions<T extends StandardSchemaV1>(
  config: EffectElectricCollectionConfig<
    InferSchemaOutput<T>,
    string | number,
    T
  > & {
    schema: T
  }
): CollectionConfig<InferSchemaOutput<T>, string | number, T> & {
  id?: string
  utils: EffectElectricCollectionUtils
  schema: T
}

export function effectElectricCollectionOptions<T extends Row<unknown>>(
  config: EffectElectricCollectionConfig<T> & {
    schema?: never
  }
): CollectionConfig<T, string | number> & {
  id?: string
  utils: EffectElectricCollectionUtils
  schema?: never
}

export function effectElectricCollectionOptions(
  config: EffectElectricCollectionConfig<any, any, any>
): CollectionConfig<any, string | number, any> & {
  id?: string
  utils: EffectElectricCollectionUtils
  schema?: any
} {
  // Convert Effect handlers to Promise handlers
  const promiseOnInsert = convertInsertHandler(config.onInsert)
  const promiseOnUpdate = convertUpdateHandler(config.onUpdate)
  const promiseOnDelete = convertDeleteHandler(config.onDelete)

  // Create the standard electric collection options
  const standardConfig = electricCollectionOptions({
    ...config,
    onInsert: promiseOnInsert,
    onUpdate: promiseOnUpdate,
    onDelete: promiseOnDelete,
  } as any)

  // Wrap awaitTxId with Effect version
  const awaitTxIdEffect = (
    txid: Txid,
    timeout: number = 30000
  ): Effect.Effect<boolean, TxIdTimeoutError | InvalidTxIdError> => {
    if (typeof txid !== "number") {
      return Effect.fail(
        new InvalidTxIdError({
          message: `Expected txid to be a number, got ${typeof txid}`,
          receivedType: typeof txid,
        })
      )
    }

    return Effect.tryPromise({
      try: () => standardConfig.utils.awaitTxId(txid, timeout),
      catch: (error) => {
        if (error instanceof Error && error.message.includes("timeout")) {
          return new TxIdTimeoutError({
            message: `Timeout waiting for txid ${txid}`,
            txid,
            timeout,
          })
        }
        return new InvalidTxIdError({
          message: `Invalid txid: ${error}`,
          receivedType: typeof txid,
        })
      },
    })
  }

  return {
    ...standardConfig,
    utils: {
      ...standardConfig.utils,
      awaitTxIdEffect,
    },
  }
}
