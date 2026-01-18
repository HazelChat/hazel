import type { Row, ShapeStreamOptions } from "@electric-sql/client"
import type { StandardSchemaV1 } from "@standard-schema/spec"
import type { Collection, CollectionConfig, CollectionStatus } from "@tanstack/db"
import type { ElectricCollectionUtils, Txid } from "@tanstack/electric-db-collection"
import { electricCollectionOptions } from "@tanstack/electric-db-collection"
import { createCollection as tanstackCreateCollection } from "@tanstack/react-db"
import { Effect, type ManagedRuntime, Option, Schema } from "effect"
import { InvalidTxIdError, TxIdTimeoutError } from "./errors"
import { convertDeleteHandler, convertInsertHandler, convertUpdateHandler } from "./handlers"
import { CollectionInErrorEffectError, wrapTanStackError } from "./tanstack-errors"
import type { BackoffConfig, EffectElectricCollectionConfig } from "./types"

// Re-export CollectionStatus from @tanstack/db
export type { CollectionStatus } from "@tanstack/db"

/**
 * Error returned when the collection's last error is retrieved.
 * Wraps the underlying TanStack DB error with collection context.
 */
export class CollectionSyncEffectError extends Schema.TaggedError<CollectionSyncEffectError>()(
	"CollectionSyncEffectError",
	{
		message: Schema.String,
		collectionId: Schema.optional(Schema.String),
		cause: Schema.optional(Schema.Unknown),
	},
) {}

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

		// Check if this is a 401 auth error - stop retrying and trigger session expired
		const errorStatus = (error as { status?: number })?.status
		if (errorStatus === 401) {
			console.warn(`${prefix} Authentication error (401), stopping sync and triggering logout`)
			// Dispatch session expired event - the app layout will handle redirect to login
			if (typeof window !== "undefined") {
				window.dispatchEvent(new CustomEvent("auth:session-expired"))
			}
			// Return undefined to stop syncing
			return
		}

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

	/**
	 * Returns the last error that occurred during sync, if any.
	 * The error is wrapped in an Effect Option for null-safety.
	 */
	readonly lastErrorEffect: Effect.Effect<Option.Option<CollectionSyncEffectError>>

	/**
	 * Returns whether the collection is currently in an error state.
	 */
	readonly isErrorEffect: Effect.Effect<boolean>

	/**
	 * Returns the count of errors that have occurred since the collection started.
	 */
	readonly errorCountEffect: Effect.Effect<number>

	/**
	 * Returns the current collection status.
	 */
	readonly statusEffect: Effect.Effect<CollectionStatus>

	/**
	 * Clears the error state and attempts to recover the collection.
	 * Fails with CollectionSyncEffectError if the clear operation fails.
	 */
	readonly clearErrorEffect: Effect.Effect<void, CollectionSyncEffectError>
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
				if (error instanceof Error && error.message.toLowerCase().includes("timeout")) {
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

	// Error tracking utilities
	const lastErrorEffect: Effect.Effect<Option.Option<CollectionSyncEffectError>> = Effect.sync(() => {
		const lastError = standardConfig.utils.lastError
		if (!lastError) {
			return Option.none()
		}
		const wrappedError = wrapTanStackError(lastError, { collectionId: config.id })
		return Option.some(
			new CollectionSyncEffectError({
				message: lastError instanceof Error ? lastError.message : String(lastError),
				collectionId: config.id,
				cause: wrappedError,
			}),
		)
	})

	const isErrorEffect: Effect.Effect<boolean> = Effect.sync(() => standardConfig.utils.isError)

	const errorCountEffect: Effect.Effect<number> = Effect.sync(() => standardConfig.utils.errorCount)

	const statusEffect: Effect.Effect<CollectionStatus> = Effect.sync(() => standardConfig.utils.status)

	const clearErrorEffect: Effect.Effect<void, CollectionSyncEffectError> = Effect.try({
		try: () => standardConfig.utils.clearError(),
		catch: (error) =>
			new CollectionSyncEffectError({
				message: `Failed to clear error: ${error instanceof Error ? error.message : String(error)}`,
				collectionId: config.id,
				cause: error,
			}),
	})

	return {
		...standardConfig,
		utils: {
			...standardConfig.utils,
			awaitTxIdEffect,
			lastErrorEffect,
			isErrorEffect,
			errorCountEffect,
			statusEffect,
			clearErrorEffect,
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
