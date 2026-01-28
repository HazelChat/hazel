# @hazel/tanstack-db-atom

TanStack DB utilities for Effect Atom - provides reactive atoms that integrate with TanStack DB collections and queries.

## Features

- **Type-safe reactive atoms** from TanStack DB queries
- **Automatic subscription management** with cleanup on unmount
- **Result-based error handling** with `Result.Result<T>`
- **Support for single and array results**
- **Conditional queries** that can be enabled/disabled
- **Integration with Effect Atom ecosystem**

## Installation

This package is part of the Hazel workspace:

```json
{
	"dependencies": {
		"@hazel/tanstack-db-atom": "workspace:*"
	}
}
```

## Usage

### Basic Query

Create an atom from a TanStack DB query:

```typescript
import { makeQuery } from '@hazel/tanstack-db-atom'
import { useAtom } from '@effect-atom/atom-react'
import { eq } from '@tanstack/db'

// Define query atom
const activeTodosAtom = makeQuery((q) =>
  q.from({ todos: todoCollection })
   .where(({ todos }) => eq(todos.completed, false))
   .select(({ todos }) => ({
     id: todos.id,
     text: todos.text
   }))
)

// Use in React component
function TodoList() {
  const todosResult = useAtom(activeTodosAtom)

  return Result.match(todosResult, {
    onWaiting: () => <Loading />,
    onFailure: (error) => <Error error={error} />,
    onSuccess: (todos) => (
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>{todo.text}</li>
        ))}
      </ul>
    )
  })
}
```

### Unsafe Query (Simplified)

For when you don't need error handling:

```typescript
const todosAtom = makeQueryUnsafe((q) =>
  q.from({ todos: todoCollection })
)

function TodoList() {
  const todos = useAtom(todosAtom) // Array<Todo> | undefined

  if (!todos) return <Loading />

  return <ul>{todos.map(todo => <TodoItem key={todo.id} {...todo} />)}</ul>
}
```

### Conditional Queries

Queries that can be enabled/disabled based on runtime conditions:

```typescript
const userTodosAtom = makeQueryConditional((q) => {
	const userId = getCurrentUserId()
	if (!userId) return null // Disabled when no user

	return q.from({ todos: todoCollection }).where(({ todos }) => eq(todos.userId, userId))
})
```

### Single Result Queries

For queries that return a single item:

```typescript
const currentUserAtom = makeQuery(
	(q) =>
		q
			.from({ users: userCollection })
			.where(({ users }) => eq(users.id, currentUserId))
			.findOne(), // Returns User | undefined instead of Array<User>
)
```

### Working with Existing Collections

Create atoms from pre-existing TanStack DB collections:

```typescript
import { makeCollectionAtom, makeSingleCollectionAtom } from "@hazel/tanstack-db-atom"

// For collections that return arrays
const todosAtom = makeCollectionAtom(todoCollection)

// For collections with singleResult: true
const userAtom = makeSingleCollectionAtom(currentUserCollection)
```

### Atom Families

Create parameterized queries with Atom families:

```typescript
import { Atom } from "@effect-atom/atom-react"

const todosByStatusFamily = Atom.family((completed: boolean) =>
	makeQuery((q) => q.from({ todos: todoCollection }).where(({ todos }) => eq(todos.completed, completed))),
)

function CompletedTodos() {
	const completedTodos = useAtom(todosByStatusFamily(true))
	// ...
}
```

### Complex Queries with Joins

TanStack DB's query builder supports joins and complex transformations:

```typescript
const enrichedTodosAtom = makeQuery((q) =>
	q
		.from({ todos: todoCollection })
		.join({ users: userCollection }, ({ todos, users }) => eq(todos.userId, users.id))
		.where(({ todos }) => eq(todos.completed, false))
		.select(({ todos, users }) => ({
			id: todos.id,
			text: todos.text,
			userName: users.name,
			userAvatar: users.avatarUrl,
		})),
)
```

## API Reference

### `makeQuery`

Creates an Atom from a TanStack DB query function.

```typescript
function makeQuery<TContext extends Context>(
	queryFn: (q: InitialQueryBuilder) => QueryBuilder<TContext>,
	options?: QueryOptions,
): Atom<Result<InferResultType<TContext>>>
```

**Options:**

- `gcTime`: Garbage collection time in milliseconds (default: 0)
- `startSync`: Whether to start sync immediately (default: true)
- `suspendOnWaiting`: Suspend on waiting state with `Atom.result()` (default: false)

**Returns:** `Atom<Result<T>>` - An atom that emits Result states

### `makeQueryUnsafe`

Creates an Atom that returns data or undefined (no Result wrapper).

```typescript
function makeQueryUnsafe<TContext extends Context>(
	queryFn: (q: InitialQueryBuilder) => QueryBuilder<TContext>,
	options?: QueryOptions,
): Atom<InferResultType<TContext> | undefined>
```

### `makeQueryConditional`

Creates an Atom from a conditional query function.

```typescript
function makeQueryConditional<TContext extends Context>(
	queryFn: (q: InitialQueryBuilder) => QueryBuilder<TContext> | null | undefined,
	options?: QueryOptions,
): Atom<Result<InferResultType<TContext>> | undefined>
```

### `makeCollectionAtom`

Creates an Atom from an existing TanStack DB collection.

```typescript
function makeCollectionAtom<T extends object, TKey extends string | number>(
	collection: Collection<T, TKey> & NonSingleResult,
): Atom<Result<Array<T>>>
```

### `makeSingleCollectionAtom`

Creates an Atom from a single-result collection.

```typescript
function makeSingleCollectionAtom<T extends object, TKey extends string | number>(
	collection: Collection<T, TKey> & SingleResult,
): Atom<Result<T | undefined>>
```

## How It Works

### Lifecycle Management

1. **Initial Load**: Collection sync starts immediately (unless `startSync: false`)
2. **Status Mapping**:
    - `idle`/`loading` → `Result.waiting`
    - `error` → `Result.failure`
    - `ready` → `Result.success(data)`
3. **Reactive Updates**: Subscribes to `collection.subscribeChanges()`
4. **Cleanup**: Unsubscribes automatically via `get.addFinalizer()`

### Incremental View Maintenance

TanStack DB uses **D2 (Differential Datalog)** for efficient incremental updates:

- Changes are computed incrementally, not by re-running full queries
- Only affected rows trigger updates
- Joins and complex transformations are automatically optimized

### Memory Management

- Collections are cleaned up when atom is unmounted (gcTime: 0 by default)
- Subscriptions are automatically removed via finalizers
- No memory leaks - all resources properly cleaned up

## Integration with Effect Atom

Works seamlessly with other Effect Atom features:

```typescript
// Combine with Atom.map
const todoCountAtom = Atom.map(
	makeQueryUnsafe((q) => q.from({ todos: todoCollection })),
	(todos) => todos?.length ?? 0,
)

// Use with Atom.flatMap
const selectedTodoAtom = Atom.flatMap(selectedIdAtom, (id) =>
	makeQuery((q) =>
		q
			.from({ todos: todoCollection })
			.where(({ todos }) => eq(todos.id, id))
			.findOne(),
	),
)

// Combine multiple queries
const dashboardDataAtom = Atom.all({
	todos: makeQuery((q) => q.from({ todos: todoCollection })),
	users: makeQuery((q) => q.from({ users: userCollection })),
	stats: makeQuery((q) => q.from({ stats: statsCollection })),
})
```

## Benefits

1. **Seamless Integration**: Natural bridge between TanStack DB and Effect Atom
2. **Type Safety**: Full TypeScript inference throughout
3. **Performance**: Leverages D2 for efficient incremental updates
4. **Familiar API**: Similar to `useLiveQuery` and `AtomLiveStore`
5. **Composable**: Works with Atom.family, Atom.map, etc.
6. **Error Handling**: Built-in Result types for safe error handling
7. **Lifecycle Management**: Automatic subscription cleanup via finalizers

## Comparison with useLiveQuery

| Feature        | useLiveQuery (React) | makeQuery (Effect Atom) |
| -------------- | -------------------- | ----------------------- |
| Framework      | React                | Framework-agnostic      |
| Subscription   | useSyncExternalStore | Atom finalizers         |
| Error Handling | Status flags         | Result types            |
| Composability  | Limited              | High (Atom combinators) |
| TypeScript     | Full inference       | Full inference          |
| Performance    | Optimized            | Optimized               |

## License

MIT
