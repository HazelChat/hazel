# @hazel/rivet-effect Migration Guide

## Breaking Changes

### 1. Context service naming

- Use `RivetActorContext`
- `ActorContextTag` has been removed

### 2. Wrapper return types

- `Action.effect(...)` now explicitly returns `Promise<...>`
- `Hook.effect(...)` now explicitly returns `Promise<...>`

This matches real runtime behavior and removes unsound casts.

### 3. Queue helpers are now error-aware

- `Queue.next(...)` now returns `Effect<Option<QueueMessage>, QueueReceiveError | QueueUnavailableError, never>`
- `Queue.nextMultiple(...)` now returns `Effect<ReadonlyArray<QueueMessage>, QueueReceiveError | QueueUnavailableError, never>`

Handle queue failures with `catchTag`.

### 4. State persistence now has explicit failure type

- `saveState(...)` now returns `Effect<void, StatePersistenceError, never>`

## New Safe Wrappers

- `Hook.try(...)`: maps failures/defects to `RuntimeExecutionError`
- `Action.try(...)`: maps failures/defects to `RuntimeExecutionError`

These are intended for actor boundaries where you want one standardized runtime error shape.

## API Mapping

| Previous                                 | Current                                    |
| ---------------------------------------- | ------------------------------------------ |
| `ActorContextTag`                        | `RivetActorContext`                        |
| `Action.effect` (typed as sync return)   | `Action.effect` (explicit async `Promise`) |
| `Hook.effect` (typed as sync return)     | `Hook.effect` (explicit async `Promise`)   |
| queue helpers with `never` error channel | queue helpers with tagged queue errors     |

## Recommended Upgrade Steps

1. Replace `ActorContextTag` with `RivetActorContext`.
2. Audit action/hook call sites and treat wrapper execution as async (`Promise`).
3. Add `catchTag` handling for queue and state persistence operations.
4. Use `Action.try`/`Hook.try` at external boundaries where normalized runtime errors are preferred.
