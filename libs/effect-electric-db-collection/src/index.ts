// Core collection creation

// Re-export useful types from electric-db-collection
export type { Txid } from "@tanstack/electric-db-collection"
export {
	COLLECTION_ERROR_STATE_CHANGED_EVENT,
	CollectionSyncEffectError,
	type CollectionStatus,
	createEffectCollection,
	type EffectCollection,
	type EffectElectricCollectionUtils,
	effectElectricCollectionOptions,
} from "./collection"
// Errors
export {
	DeleteError,
	ElectricCollectionError,
	InsertError,
	InvalidTxIdError,
	MissingTxIdError,
	OptimisticActionError,
	SyncConfigError,
	SyncError,
	TxIdTimeoutError,
	UpdateError,
} from "./errors"
// TanStack DB Error Wrappers
export {
	CollectionInErrorEffectError,
	DuplicateKeyEffectError,
	isPermanentError,
	isRecoverableError,
	KeyNotFoundEffectError,
	KeyUpdateNotAllowedEffectError,
	SchemaValidationEffectError,
	type TanStackEffectError,
	TanStackEffectErrorSchema,
	TransactionStateEffectError,
	UndefinedKeyEffectError,
	type ValidationIssue,
	wrapTanStackError,
} from "./tanstack-errors"
// Effect handlers
export { convertDeleteHandler, convertInsertHandler, convertUpdateHandler } from "./handlers"
// Optimistic Actions
export {
	type CollectionInput,
	// Legacy API (still supported)
	createEffectOptimisticAction,
	type EffectOptimisticActionOptions,
	type MutationContext,
	type MutationParams,
	type MutationResultWithTxId,
	type OptimisticActionConfig,
	type OptimisticActionResult,
	type OptimisticMutateResult,
	// New API with automatic collection sync
	optimisticAction,
} from "./optimistic-action"
// Service and Layer APIs
export { ElectricCollection, type ElectricCollectionService, makeElectricCollectionLayer } from "./service"
// Types
export type {
	BackoffConfig,
	EffectDeleteHandler,
	EffectElectricCollectionConfig,
	EffectInsertHandler,
	EffectUpdateHandler,
} from "./types"
