import { Schema } from "effect"

/**
 * Base error for Electric Collection operations
 */
export class ElectricCollectionError extends Schema.TaggedErrorClass<ElectricCollectionError>()(
	"ElectricCollectionError",
	{
		message: Schema.String,
		cause: Schema.optional(Schema.Unknown),
	},
) {}

/**
 * Error thrown when an insert operation fails
 */
export class InsertError extends Schema.TaggedErrorClass<InsertError>()("InsertError", {
	message: Schema.String,
	data: Schema.optional(Schema.Unknown),
	cause: Schema.optional(Schema.Unknown),
}) {}

/**
 * Error thrown when an update operation fails
 */
export class UpdateError extends Schema.TaggedErrorClass<UpdateError>()("UpdateError", {
	message: Schema.String,
	key: Schema.optional(Schema.Unknown),
	cause: Schema.optional(Schema.Unknown),
}) {}

/**
 * Error thrown when a delete operation fails
 */
export class DeleteError extends Schema.TaggedErrorClass<DeleteError>()("DeleteError", {
	message: Schema.String,
	key: Schema.optional(Schema.Unknown),
	cause: Schema.optional(Schema.Unknown),
}) {}

/**
 * Error thrown when waiting for a transaction ID times out
 */
export class TxIdTimeoutError extends Schema.TaggedErrorClass<TxIdTimeoutError>()("TxIdTimeoutError", {
	message: Schema.String,
	txid: Schema.Number,
	timeout: Schema.Number,
}) {}

/**
 * Error thrown when a required transaction ID is missing from handler result
 */
export class MissingTxIdError extends Schema.TaggedErrorClass<MissingTxIdError>()("MissingTxIdError", {
	message: Schema.String,
	operation: Schema.Literal("insert", "update", "delete"),
}) {}

/**
 * Error thrown when an invalid transaction ID type is provided
 */
export class InvalidTxIdError extends Schema.TaggedErrorClass<InvalidTxIdError>()("InvalidTxIdError", {
	message: Schema.String,
	receivedType: Schema.String,
}) {}

/**
 * Error thrown when sync configuration is invalid
 */
export class SyncConfigError extends Schema.TaggedErrorClass<SyncConfigError>()("SyncConfigError", {
	message: Schema.String,
	cause: Schema.optional(Schema.Unknown),
}) {}

/**
 * Error thrown when an optimistic action fails
 */
export class OptimisticActionError extends Schema.TaggedErrorClass<OptimisticActionError>()(
	"OptimisticActionError",
	{
		message: Schema.String,
		cause: Schema.optional(Schema.Unknown),
	},
) {}

/**
 * Error thrown when collection sync fails during optimistic action
 */
export class SyncError extends Schema.TaggedErrorClass<SyncError>()("SyncError", {
	message: Schema.String,
	txid: Schema.optional(Schema.Number),
	collectionName: Schema.optional(Schema.String),
	timeout: Schema.optional(Schema.Number),
	cause: Schema.optional(Schema.Unknown),
}) {}
