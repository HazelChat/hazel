# Notifications Module

This module centralizes desktop notification behavior for Hazel.

## Invariants

- Every notification event is processed by the orchestrator exactly once per session unless a sink fails.
- Policy decisions (muted/focus/session-start) are computed once in the orchestrator.
- Sinks are execution-only and must not duplicate policy logic.
- Diagnostics are emitted for every processing attempt and are consumable by debug tooling.

## Main parts

- `types.ts`: shared contracts for decisions, events, sink outcomes.
- `orchestrator.ts`: queueing, dedupe, decisioning, sink fan-out.
- `sinks/`: concrete sound/native/in-app handlers.
- `diagnostics-store.ts`: in-memory diagnostics timeline for debug UI.
