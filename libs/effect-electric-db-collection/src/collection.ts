import type { Row, ShapeStreamOptions } from "@electric-sql/client"
import type { StandardSchemaV1 } from "@standard-schema/spec"
import type { Collection, CollectionConfig } from "@tanstack/db"
import type { ElectricCollectionUtils, Txid } from "@tanstack/electric-db-collection"
import { electricCollectionOptions } from "@tanstack/electric-db-collection"
import { createCollection as tanstackCreateCollection } from "@tanstack/react-db"
import { Effect, type ManagedRuntime, Schema } from "effect"
import { InvalidTxIdError, TxIdTimeoutError } from "./errors"
import { convertDeleteHandler, convertInsertHandler, convertUpdateHandler } from "./handlers"
import type { BackoffConfig, EffectElectricCollectionConfig } from "./types"

/**
 * Type for the ShapeStream onError handler
 * Returns void to stop syncing, or an object to continue with modified params/headers
 */
type OnErrorHandler = NonNullable<ShapeStreamOptions<unknown>["onError"]>

/**
 * Default backoff configuration
 */
const DEFAULT_BACKOFF_CONFIG: Required<BackoffConfig> = {
	initialDelayMs: 1000,
	maxDelayMs: 30000,
	multiplier: 2,
	maxRetries: Number.POSITIVE_INFINITY,
	jitter: true,
}

/**
 * Creates an onError handler with exponential backoff
 */
function createBackoffOnError(
	collectionId: string | undefined,
	backoffConfig: Required<BackoffConfig>,
	userOnError?: OnErrorHandler,
): OnErrorHandler {
	let retryCount = 0
	let currentDelay = backoffConfig.initialDelayMs
	let resetTimeout: ReturnType<typeof setTimeout> | null = null

	// Reset backoff state after a period of successful operation
	const scheduleReset = () => {
		if (resetTimeout) {
			clearTimeout(resetTimeout)
		}
		// Reset after 60 seconds of no errors
		resetTimeout = setTimeout(() => {
			retryCount = 0
			currentDelay = backoffConfig.initialDelayMs
		}, 60000)
	}

	return async (error) => {
		retryCount++

		const prefix = collectionId ? `[${collectionId}]` : "[electric]"

		// Check if max retries exceeded
		if (retryCount > backoffConfig.maxRetries) {
			console.error(
				`${prefix} Max retries (${backoffConfig.maxRetries}) exceeded, stopping sync`,
				error,
			)
			// Return undefined to stop syncing
			return
		}

		// Calculate delay with optional jitter
		const delay = backoffConfig.jitter
			? currentDelay * (0.5 + Math.random()) // Jitter between 50-150% of delay
			: currentDelay

		console.warn(
			`${prefix} Connection error, retrying in ${Math.round(delay)}ms (attempt ${retryCount}/${backoffConfig.maxRetries === Number.POSITIVE_INFINITY ? "∞" : backoffConfig.maxRetries})`,
			error,
		)

		// Wait for the delay
		await new Promise((resolve) => setTimeout(resolve, delay))

		// Increase delay for next retry (exponential backoff)
		currentDelay = Math.min(currentDelay * backoffConfig.multiplier, backoffConfig.maxDelayMs)

		// Schedule reset of backoff state
		scheduleReset()

		// Call user's onError handler if provided
		if (userOnError) {
			const result = await userOnError(error)
			// If user handler returns a result, use it
			if (result !== undefined) {
				return result
			}
		}

		// Return empty object to continue syncing with same params
		return {}
	}
}

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
		timeout?: number,
	) => Effect.Effect<boolean, TxIdTimeoutError | InvalidTxIdError>
}

/**
 * Creates Electric collection options with Effect-based handlers
 */

// With schema + with runtime (R inferred from runtime)
export function effectElectricCollectionOptions<T extends StandardSchemaV1, R>(
	config: EffectElectricCollectionConfig<
		InferSchemaOutput<T>,
		string | number,
		T,
		Record<string, never>,
		R
	> & {
		schema: T
		runtime: ManagedRuntime.ManagedRuntime<R, any>
	},
): CollectionConfig<InferSchemaOutput<T>, string | number, T> & {
	id?: string
	utils: EffectElectricCollectionUtils
	schema: T
}

// With schema + without runtime (R must be never)
export function effectElectricCollectionOptions<T extends StandardSchemaV1>(
	config: EffectElectricCollectionConfig<
		InferSchemaOutput<T>,
		string | number,
		T,
		Record<string, never>,
		never
	> & {
		schema: T
		runtime?: never
	},
): CollectionConfig<InferSchemaOutput<T>, string | number, T> & {
	id?: string
	utils: EffectElectricCollectionUtils
	schema: T
}

// Without schema + with runtime (R inferred from runtime)
export function effectElectricCollectionOptions<T extends Row<unknown>, R>(
	config: EffectElectricCollectionConfig<T, string | number, never, Record<string, never>, R> & {
		schema?: never
		runtime: ManagedRuntime.ManagedRuntime<R, any>
	},
): CollectionConfig<T, string | number> & {
	id?: string
	utils: EffectElectricCollectionUtils
	schema?: never
}

// Without schema + without runtime (R must be never)
export function effectElectricCollectionOptions<T extends Row<unknown>>(
	config: EffectElectricCollectionConfig<T, string | number, never, Record<string, never>, never> & {
		schema?: never
		runtime?: never
	},
): CollectionConfig<T, string | number> & {
	id?: string
	utils: EffectElectricCollectionUtils
	schema?: never
}

export function effectElectricCollectionOptions(
	config: EffectElectricCollectionConfig<any, any, any, any, any>,
): CollectionConfig<any, string | number, any> & {
	id?: string
	utils: EffectElectricCollectionUtils
	schema?: any
} {
	const promiseOnInsert = convertInsertHandler(config.onInsert, config.runtime)
	const promiseOnUpdate = convertUpdateHandler(config.onUpdate, config.runtime)
	const promiseOnDelete = convertDeleteHandler(config.onDelete, config.runtime)

	// Handle backoff configuration
	const backoffEnabled = config.backoff !== false
	const backoffConfig: Required<BackoffConfig> = backoffEnabled
		? { ...DEFAULT_BACKOFF_CONFIG, ...(typeof config.backoff === "object" ? config.backoff : {}) }
		: DEFAULT_BACKOFF_CONFIG // Won't be used when disabled

	// Create modified shapeOptions with backoff-wrapped onError
	const modifiedShapeOptions = backoffEnabled
		? {
				...config.shapeOptions,
				onError: createBackoffOnError(config.id, backoffConfig, config.shapeOptions.onError),
			}
		: config.shapeOptions

	const standardConfig = electricCollectionOptions({
		...config,
		shapeOptions: modifiedShapeOptions,
		onInsert: promiseOnInsert,
		onUpdate: promiseOnUpdate,
		onDelete: promiseOnDelete,
	} as any)
	const awaitTxIdEffect = (
		txid: Txid,
		timeout: number = 30000,
	): Effect.Effect<boolean, TxIdTimeoutError | InvalidTxIdError> => {
		if (typeof txid !== "number") {
			return Effect.fail(
				new InvalidTxIdError({
					message: `Expected txid to be a number, got ${typeof txid}`,
					receivedType: typeof txid,
				}),
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

/**
 * A collection created with Effect-native utilities.
 * Extends the base Collection with awaitTxIdEffect on utils.
 */
export type EffectCollection<
	T extends Row<unknown>,
	TKey extends string | number = string | number,
> = Collection<T, TKey> & {
	utils: EffectElectricCollectionUtils
}

/**
 * Creates a collection with Effect-native utilities.
 * Accepts Effect Schema directly and converts to StandardSchemaV1 internally.
 *
 * @example
 * ```typescript
 * const messageCollection = createEffectCollection({
 *   id: "messages",
 *   runtime: runtime,
 *   shapeOptions: { url: electricUrl, params: { table: "messages" } },
 *   schema: Message.Model.json,  // Direct Effect Schema!
 *   getKey: (item) => item.id,
 *   onInsert: ({ transaction }) => Effect.gen(function* () { ... }),
 * })
 *
 * // messageCollection.utils.awaitTxIdEffect is properly typed!
 * ```
 */
export function createEffectCollection<A extends Row<unknown>, I, TRuntime>(
	config: Omit<
		EffectElectricCollectionConfig<A, string | number, never, Record<string, never>, TRuntime>,
		"schema"
	> & {
		schema: Schema.Schema<A, I>
		runtime: ManagedRuntime.ManagedRuntime<TRuntime, unknown>
	},
): EffectCollection<A> {
	// Convert Effect Schema to StandardSchemaV1 internally
	const standardSchema = Schema.standardSchemaV1(config.schema)

	const options = effectElectricCollectionOptions({
		...config,
		schema: standardSchema,
	} as any)

	// biome-ignore lint/suspicious/noExplicitAny: Type compatibility between tanstack/db versions
	const collection = tanstackCreateCollection(options as any)
	return collection as unknown as EffectCollection<A>
}
