# Database Package

Shared database package using Drizzle ORM and PostgreSQL with Effect-TS integration.

## Features

- **Drizzle ORM**: Type-safe database queries with PostgreSQL
- **Effect-TS Integration**: Functional error handling and dependency management
- **Automatic Transaction Context**: Transaction propagation via Effect Context
- **Policy-Based Authorization**: Row-level security with policy enforcement
- **Schema Validation**: Input validation using Effect Schema

## Automatic Transaction Context

The database package provides automatic transaction context propagation using Effect's Context system. This eliminates the need to manually pass transaction clients through repository method calls.

### How It Works

When you create a transaction using `Database.transaction()`, the transaction client is automatically made available to all repository methods and queries within that transaction via Effect's Context system.

**TransactionContext Service**

The transaction context is provided through a service:

```typescript
export interface TransactionService {
	readonly execute: TxFn
}

export class TransactionContext extends Effect.Tag("TransactionContext")<
	TransactionContext,
	TransactionService
>() {}
```

### Usage

#### Basic Transaction

```typescript
import { Database } from "@hazel/db"
import { Effect } from "effect"

const db = yield * Database.Database

const result =
	yield *
	db.transaction(
		Effect.gen(function* () {
			// All repository methods automatically use the transaction context
			const user = yield* UserRepo.insert({ name: "Alice" })
			const org = yield* OrganizationRepo.insert({ userId: user.id })

			// No need to pass transaction client!
			const txid = yield* generateTransactionId()

			return { user, org, txid }
		}),
	)
```

#### Before (Manual Transaction Threading)

```typescript
// ❌ Old approach - verbose and error-prone
yield *
	db.transaction(
		Effect.fnUntraced(function* (tx) {
			const user = yield* UserRepo.insert({ name: "Alice" }, tx)
			const org = yield* OrganizationRepo.insert({ userId: user.id }, tx)
			const txid = yield* generateTransactionId(tx)
			return { user, org, txid }
		}),
	)
```

#### After (Automatic Context)

```typescript
// ✅ New approach - clean and automatic
yield *
	db.transaction(
		Effect.gen(function* () {
			const user = yield* UserRepo.insert({ name: "Alice" })
			const org = yield* OrganizationRepo.insert({ userId: user.id })
			const txid = yield* generateTransactionId()
			return { user, org, txid }
		}),
	)
```

### Subtransactions (Explicit Override)

You can still pass an explicit transaction client to create subtransactions or override the context:

```typescript
yield *
	db.transaction(
		Effect.gen(function* () {
			const user = yield* UserRepo.insert({ name: "Alice" })

			// Get the transaction context
			const txContext = yield* Database.TransactionContext

			// Create a subtransaction by explicitly passing a different tx
			const customTx = createCustomTransaction()
			const org = yield* OrganizationRepo.insert(
				{ userId: user.id },
				customTx, // Explicit override
			)

			return { user, org }
		}),
	)
```

### Priority Order

Repository methods check for transaction clients in this order:

1. **Explicit `tx` parameter** (highest priority) - for subtransactions
2. **TransactionContext from Effect Context** - automatic propagation
3. **Regular database client** - fallback when no transaction

### Implementation Details

The transaction context is provided automatically in three places:

**1. Database.makeQuery and makeQueryWithSchema**

```typescript
Effect.gen(function* () {
	// 1. Check explicit tx parameter
	if (tx) return yield* queryFn(tx, input)

	// 2. Check TransactionContext from Effect Context
	const maybeCtx = yield* Effect.serviceOption(TransactionContext)
	if (Option.isSome(maybeCtx)) {
		return yield* queryFn(maybeCtx.value.execute, input)
	}

	// 3. Fall back to regular execute
	return yield* queryFn(execute, input)
})
```

**2. Database.transaction**

```typescript
const transaction = <T, E, R>(effect: Effect.Effect<T, E, R>) =>
	Effect.gen(function* () {
		// Transaction is provided to the effect automatically
		const withContext = effect.pipe(Effect.provideService(TransactionContext, { execute: txWrapper }))
		return yield* withContext
	})
```

**3. generateTransactionId**

```typescript
Effect.gen(function* () {
	// Check explicit tx first, then context, then fail
	let txExecutor = tx

	if (!txExecutor) {
		const maybeCtx = yield* Effect.serviceOption(Database.TransactionContext)
		if (Option.isSome(maybeCtx)) {
			txExecutor = maybeCtx.value.execute
		}
	}

	if (!txExecutor) {
		return yield* Effect.die("Must be called within a transaction")
	}

	return yield* txExecutor((client) => client.execute(`SELECT pg_current_xact_id()::xid::text as txid`))
})
```

## Repository Pattern

### Creating a Repository

```typescript
import { ModelRepository, schema } from "@hazel/db"
import { Effect } from "effect"

export class UserRepo extends Effect.Service<UserRepo>()("UserRepo", {
	accessors: true,
	effect: Effect.gen(function* () {
		const baseRepo = yield* ModelRepository.makeRepository(schema.usersTable, User.Model, {
			idColumn: "id",
			name: "User",
		})

		return baseRepo
	}),
	dependencies: [DatabaseLive],
}) {}
```

### Standard Repository Methods

All repositories include these methods:

- `insert(data, tx?)`: Insert a new record
- `insertVoid(data, tx?)`: Insert without returning
- `update(data, tx?)`: Update a record
- `updateVoid(data, tx?)`: Update without returning
- `findById(id, tx?)`: Find by ID (returns `Option<T>`)
- `deleteById(id, tx?)`: Delete by ID
- `with(id, fn)`: Execute function with record or fail

### Custom Repository Methods

```typescript
export class ChannelMemberRepo extends Effect.Service<ChannelMemberRepo>()("ChannelMemberRepo", {
	accessors: true,
	effect: Effect.gen(function* () {
		const baseRepo = yield* ModelRepository.makeRepository(/*...*/)
		const db = yield* Database.Database

		// Custom method with automatic transaction support
		const findByChannelAndUser = (channelId: ChannelId, userId: UserId, tx?: TxFn) =>
			db.makeQuery(
				(execute, data) =>
					execute((client) =>
						client
							.select()
							.from(schema.channelMembersTable)
							.where(
								and(
									eq(schema.channelMembersTable.channelId, data.channelId),
									eq(schema.channelMembersTable.userId, data.userId),
								),
							),
					),
				policyRequire("ChannelMember", "select"),
			)({ channelId, userId }, tx)

		return {
			...baseRepo,
			findByChannelAndUser,
		}
	}),
	dependencies: [DatabaseLive],
}) {}
```

## Policy-Based Authorization

The database layer integrates with the authorization system to enforce row-level security policies.

```typescript
import { policyRequire, policyUse } from "@hazel/effect-lib"

// Policy enforcement in repositories
const insert = (data, tx?) =>
	db.makeQueryWithSchema(
		schema.insert,
		(execute, input) => execute((client) => client.insert(table).values(input)),
		policyRequire("User", "create"), // Require policy check
	)(data, tx)

// Policy usage in route handlers
yield * UserRepo.insert(data).pipe(policyUse(UserPolicy.canCreate(organizationId)))
```

## Error Handling

The database layer provides typed errors:

```typescript
export class DatabaseError extends Data.TaggedError("DatabaseError")<{
    readonly type: "unique_violation" | "foreign_key_violation" | "connection_error"
    readonly cause: postgres.PostgresError
}>

// Remap database errors in routes
yield* db.transaction(effect).pipe(
    withRemapDbErrors("User", "create")
)
```

## Configuration

Database configuration is provided via Effect Layer:

```typescript
import { Database } from "@hazel/db"

export const DatabaseLive = Layer.unwrapEffect(
	Effect.gen(function* () {
		return Database.layer({
			url: Redacted.make(process.env.DATABASE_URL),
			ssl: true,
		})
	}),
)
```

## Benefits

✅ **Type Safety**: Full TypeScript type inference across all queries
✅ **Automatic Transactions**: No manual transaction threading required
✅ **Error Handling**: Typed database errors with Effect-TS
✅ **Authorization**: Built-in policy enforcement
✅ **Testability**: Easy to mock via Effect's dependency injection
✅ **Composability**: Combine multiple repository operations safely
✅ **Clean Code**: Reduced boilerplate in route handlers
