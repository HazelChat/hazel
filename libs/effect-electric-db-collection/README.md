# @tanstack/effect-electric-db-collection

Effect wrapper for ElectricSQL collections in TanStack DB, providing type-safe, composable operations with proper error handling and dependency injection.

## Features

- 🎯 **Type-safe Effect handlers** - Convert promise-based mutation handlers to Effect-based handlers
- 🔌 **Service & Layer APIs** - Integrate collections as Effect services with dependency injection
- 🚨 **Typed errors** - Proper error handling with tagged errors
- 🔄 **Transaction awaiting** - Effect-based `awaitTxId` for transaction synchronization
- 🧩 **Composable** - Works seamlessly with the Effect ecosystem

## Installation

```bash
pnpm add @tanstack/effect-electric-db-collection effect
```

## Basic Usage

### Using `effectElectricCollectionOptions`

This is the simplest way to use Effect handlers with your electric collections:

```typescript
import { Effect } from "effect"
import { createCollection } from "@tanstack/db"
import { effectElectricCollectionOptions } from "@tanstack/effect-electric-db-collection"
import { selectTodoSchema } from "./schema"

const todoCollection = createCollection(
	effectElectricCollectionOptions({
		id: "todos",
		shapeOptions: {
			url: "http://localhost:3003/v1/shape",
			params: { table: "todos" },
		},
		getKey: (item) => item.id,
		schema: selectTodoSchema,

		// Effect-based insert handler
		onInsert: ({ transaction }) =>
			Effect.gen(function* () {
				const item = transaction.mutations[0].modified
				const response = yield* api.todos.create(item)
				return { txid: response.txid }
			}),

		// Effect-based update handler
		onUpdate: ({ transaction }) =>
			Effect.gen(function* () {
				const txids = yield* Effect.all(
					transaction.mutations.map((mutation) =>
						api.todos
							.update(mutation.original.id, mutation.changes)
							.pipe(Effect.map((res) => res.txid)),
					),
				)
				return { txid: txids }
			}),

		// Effect-based delete handler
		onDelete: ({ transaction }) =>
			Effect.gen(function* () {
				const txids = yield* Effect.all(
					transaction.mutations.map((mutation) =>
						api.todos.delete(mutation.original.id).pipe(Effect.map((res) => res.txid)),
					),
				)
				return { txid: txids }
			}),
	}),
)

// Use the awaitTxId Effect utility
const program = Effect.gen(function* () {
	const tx = todoCollection.insert({ text: "Buy milk", completed: false })
	const txid = yield* Effect.promise(() => tx.isPersisted.promise)

	// Wait for sync using Effect
	yield* todoCollection.utils.awaitTxIdEffect(txid.txid)

	console.log("Item synced!")
})

Effect.runPromise(program)
```

### Using Service & Layer API

For more advanced use cases with dependency injection:

```typescript
import { Effect, Layer, Context } from "effect"
import { ElectricCollection, makeElectricCollectionLayer } from "@tanstack/effect-electric-db-collection"

// Define your API service
class ApiService extends Effect.Service<ApiService>()("ApiService", {
	effect: Effect.succeed({
		createTodo: (data: any) =>
			Effect.tryPromise(() => fetch("/api/todos", { method: "POST", body: JSON.stringify(data) })),
		updateTodo: (id: string, changes: any) =>
			Effect.tryPromise(() =>
				fetch(`/api/todos/${id}`, { method: "PATCH", body: JSON.stringify(changes) }),
			),
		deleteTodo: (id: string) => Effect.tryPromise(() => fetch(`/api/todos/${id}`, { method: "DELETE" })),
	}),
}) {}

// Create collection tag
const TodoCollection = ElectricCollection<Todo>("todos")

// Create collection layer with dependencies
const TodoCollectionLive = makeElectricCollectionLayer(TodoCollection, {
	id: "todos",
	shapeOptions: {
		url: "http://localhost:3003/v1/shape",
		params: { table: "todos" },
	},
	getKey: (item) => item.id,
	schema: selectTodoSchema,

	// IMPORTANT: Handlers must be self-contained
	// Provide dependencies within the handler using Effect.provide
	onInsert: ({ transaction }) =>
		Effect.gen(function* () {
			const api = yield* ApiService
			const item = transaction.mutations[0].modified
			const response = yield* api.createTodo(item)
			return { txid: response.txid }
		}).pipe(Effect.provide(ApiService.Default)), // ← Provide dependencies here!
})

// Use in your program
const program = Effect.gen(function* () {
	const collection = yield* TodoCollection

	yield* collection.insert({ text: "Buy milk", completed: false })

	const todos = yield* collection.toArray
	console.log("Todos:", todos)
}).pipe(
	Effect.provide(TodoCollectionLive),
	// Note: ApiService is already provided within the handlers
)

Effect.runPromise(program)
```

**Important**: Handler Effects must be self-contained (all dependencies provided). Use `Effect.provide()` or `Layer.provide()` at the end of your handler to inject required services.

## Error Handling

All errors are properly typed using Effect's error channel:

```typescript
import { Effect } from "effect"
import { InsertError, TxIdTimeoutError } from "@tanstack/effect-electric-db-collection"

const program = Effect.gen(function* () {
	const collection = yield* TodoCollection

	yield* collection.insert({ text: "New todo" })
}).pipe(
	Effect.catchTag("InsertError", (error) =>
		Effect.gen(function* () {
			console.error("Insert failed:", error.message, error.cause)
			// Handle insert error
		}),
	),
	Effect.catchTag("TxIdTimeoutError", (error) =>
		Effect.gen(function* () {
			console.error(`Timeout waiting for txid ${error.txid}`)
			// Handle timeout
		}),
	),
)
```

## API Reference

### `effectElectricCollectionOptions(config)`

Creates electric collection options with Effect-based handlers.

**Config:**

- `shapeOptions` - ElectricSQL shape stream options
- `getKey` - Function to extract key from items
- `schema` - Optional validation schema
- `onInsert` - Effect-based insert handler
- `onUpdate` - Effect-based update handler
- `onDelete` - Effect-based delete handler

### `ElectricCollection<T>(id)`

Creates a service tag for an electric collection.

### `makeElectricCollectionLayer(tag, config)`

Creates a Layer for an electric collection service.

### Error Types

- `ElectricCollectionError` - Base error
- `InsertError` - Insert operation failed
- `UpdateError` - Update operation failed
- `DeleteError` - Delete operation failed
- `TxIdTimeoutError` - Transaction ID await timeout
- `MissingTxIdError` - Handler didn't return txid
- `InvalidTxIdError` - Invalid transaction ID type
- `SyncConfigError` - Sync configuration error

## License

MIT
