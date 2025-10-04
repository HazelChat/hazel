// Core collection creation
export {
  effectElectricCollectionOptions,
  type EffectElectricCollectionUtils,
} from "./collection"

// Service and Layer APIs
export {
  ElectricCollection,
  makeElectricCollectionLayer,
  type ElectricCollectionService,
} from "./service"

// Effect handlers
export {
  convertInsertHandler,
  convertUpdateHandler,
  convertDeleteHandler,
} from "./handlers"

// Types
export type {
  EffectElectricCollectionConfig,
  EffectInsertHandler,
  EffectUpdateHandler,
  EffectDeleteHandler,
} from "./types"

// Errors
export {
  ElectricCollectionError,
  InsertError,
  UpdateError,
  DeleteError,
  TxIdTimeoutError,
  MissingTxIdError,
  InvalidTxIdError,
  SyncConfigError,
} from "./errors"

// Re-export useful types from electric-db-collection
export type { Txid } from "@tanstack/electric-db-collection"
