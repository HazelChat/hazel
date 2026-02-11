# @hazel/rivet-effect

Effect-first helpers for building Rivet actors with typed context access, lifecycle wrappers, and runtime integration.

## Highlights

- Typed context service via `RivetActorContext`
- Effect wrappers for actor hooks and actions
- Runtime-aware execution helpers (`runPromise`, `runPromiseExit`)
- Queue helpers with explicit tagged errors
- Safe wrapper variants (`Hook.try`, `Action.try`) for standardized runtime error mapping

## Error Types

`@hazel/rivet-effect` now exports tagged errors for runtime and queue boundaries:

- `RuntimeNotConfiguredError`
- `RuntimeExecutionError`
- `QueueUnavailableError`
- `QueueReceiveError`
- `StatePersistenceError`

Use tag-based handling where effects are consumed:

```ts
import { Effect } from "effect"
import { Queue } from "@hazel/rivet-effect"

const read = Queue.next(ctx, "jobs").pipe(
	Effect.catchTag("QueueUnavailableError", () => Effect.succeed("queue unavailable")),
)
```

## Migration

See `packages/rivet-effect/MIGRATION.md` for the full API mapping and upgrade notes.
