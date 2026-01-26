# Effect Patterns for Electric Collections

This document explains the key patterns and design decisions for using Effect with Electric collections.

## Key Principle: Self-Contained Handlers

**All mutation handlers must be self-contained with `R = never`**

This means handlers cannot have "dangling" requirements. All dependencies must be provided within the handler itself before it returns.

### ❌ Incorrect (has requirements)

```typescript
// This won't work - handler has Requirements that need to be satisfied
onInsert: ({ transaction }) =>
  Effect.gen(function* () {
    const api = yield* ApiService  // ← ApiService is a requirement!
    const response = yield* api.create(...)
    return { txid: response.txid }
  })
  // Missing: Effect.provide(ApiService.Default)
```

**Type**: `Effect<{ txid: Txid }, never, ApiService>` - has `ApiService` as a requirement ❌

### ✅ Correct (self-contained)

```typescript
// This works - handler provides its own dependencies
onInsert: ({ transaction }) =>
  Effect.gen(function* () {
    const api = yield* ApiService
    const response = yield* api.create(...)
    return { txid: response.txid }
  }).pipe(Effect.provide(ApiService.Default))  // ← Dependencies provided here!
```

**Type**: `Effect<{ txid: Txid }, never, never>` - no requirements ✅

## Why This Pattern?

The handlers are converted to Promises internally using `Effect.runPromise`, which requires:

```typescript
Effect.runPromise<A, E>(effect: Effect<A, E, never>)
                                         //     ^^^^^ must be never
```

If the Effect has requirements (`R != never`), `runPromise` cannot execute it because it doesn't know how to provide those requirements.

## Dependency Injection Patterns

### Pattern 1: Direct Service Provision

```typescript
class MyApiService extends Effect.Service<MyApiService>()("MyApiService", {
	effect: Effect.succeed({
		create: (data) => Effect.succeed({ txid: 123 }),
	}),
}) {}

effectElectricCollectionOptions({
	onInsert: ({ transaction }) =>
		Effect.gen(function* () {
			const api = yield* MyApiService
			const result = yield* api.create(transaction.mutations[0].modified)
			return { txid: result.txid }
		}).pipe(Effect.provide(MyApiService.Default)),
})
```

### Pattern 2: Using Layers

```typescript
const ApiLayer = Layer.succeed(ApiService, {
	create: (data) => Effect.succeed({ txid: 123 }),
})

effectElectricCollectionOptions({
	onInsert: ({ transaction }) =>
		Effect.gen(function* () {
			const api = yield* ApiService
			const result = yield* api.create(transaction.mutations[0].modified)
			return { txid: result.txid }
		}).pipe(Effect.provide(ApiLayer)),
})
```

### Pattern 3: Multiple Dependencies

```typescript
const AllDependencies = Layer.mergeAll(ApiService.Default, LoggerService.Default, ConfigService.Default)

effectElectricCollectionOptions({
	onInsert: ({ transaction }) =>
		Effect.gen(function* () {
			const api = yield* ApiService
			const logger = yield* LoggerService
			const config = yield* ConfigService

			yield* logger.log("Inserting item...")
			const result = yield* api.create(transaction.mutations[0].modified)
			return { txid: result.txid }
		}).pipe(Effect.provide(AllDependencies)),
})
```

## Type Signature Explained

```typescript
type EffectInsertHandler<T, TKey, TUtils, E = never> = (
	params: InsertMutationFnParams<T, TKey, TUtils>,
) => Effect.Effect<
	{ txid: Txid | Array<Txid> }, // Success type
	E, // Error type (customizable)
	never // Requirements (must be never!)
>
```

- **Success**: Always returns `{ txid: ... }`
- **Error**: Can be customized (e.g., `InsertError | NetworkError`)
- **Requirements**: Must always be `never` (self-contained)

## Error Handling

Handlers can have custom error types:

```typescript
class ApiError extends Data.TaggedError("ApiError")<{
  message: string
  statusCode: number
}> {}

effectElectricCollectionOptions({
  onInsert: ({ transaction }) =>
    Effect.gen(function* () {
      const api = yield* ApiService
      const result = yield* api.create(...).pipe(
        Effect.mapError((error) =>
          new ApiError({ message: error.message, statusCode: 500 })
        )
      )
      return { txid: result.txid }
    }).pipe(Effect.provide(ApiService.Default))
})
```

The error type `ApiError` will be caught and wrapped in `InsertError` by the conversion layer.

## Common Mistakes

### Mistake 1: Forgetting to Provide Dependencies

```typescript
// ❌ Error: Effect has requirements that cannot be satisfied
onInsert: ({ transaction }) =>
	Effect.gen(function* () {
		const api = yield* ApiService
		return { txid: 123 }
	})
// Fix: Add .pipe(Effect.provide(ApiService.Default))
```

### Mistake 2: Providing Dependencies at Wrong Level

```typescript
// ❌ Wrong: Trying to provide at program level
const program = Effect.gen(function* () {
  const collection = yield* TodoCollection
  yield* collection.insert(...)
}).pipe(
  Effect.provide(TodoCollectionLive),
  Effect.provide(ApiService.Default)  // ← Too late! Handlers already executed
)

// ✅ Correct: Provide within handlers
effectElectricCollectionOptions({
  onInsert: ({ transaction }) =>
    Effect.gen(function* () {
      const api = yield* ApiService
      return { txid: 123 }
    }).pipe(Effect.provide(ApiService.Default))  // ← Provide here
})
```

### Mistake 3: Not Returning txid

```typescript
// ❌ Error: Handler must return { txid: ... }
onInsert: ({ transaction }) => Effect.succeed({ success: true }) // Missing txid!

// ✅ Correct
onInsert: ({ transaction }) => Effect.succeed({ txid: 123 })
```

## Testing Handlers

```typescript
// Create test implementations
const TestApiService = Layer.succeed(ApiService, {
  create: (data) => Effect.succeed({ txid: 999 })
})

// Use in tests
const testCollection = createCollection(
  effectElectricCollectionOptions({
    // ...config
    onInsert: ({ transaction }) =>
      Effect.gen(function* () {
        const api = yield* ApiService
        const result = yield* api.create(...)
        return { txid: result.txid }
      }).pipe(Effect.provide(TestApiService))  // ← Inject test service
  })
)
```

## Summary

1. **Handlers must be self-contained** (`R = never`)
2. **Provide dependencies within handlers** using `.pipe(Effect.provide(...))`
3. **Return `{ txid: ... }`** from all mutation handlers
4. **Error types are flexible** but will be wrapped by conversion layer
5. **Test by injecting different implementations** at handler level
