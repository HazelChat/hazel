# Changelog

## Unreleased

### Changed

- Refactored `@hazel/rivet-effect` to strengthen Effect error channels and runtime boundaries.
- Added typed SDK errors (`RuntimeExecutionError`, `QueueReceiveError`, `QueueUnavailableError`, `StatePersistenceError`).
- Standardized wrapper signatures (`Hook.effect`, `Action.effect`) to explicit async `Promise` returns.
- Added safe wrappers (`Hook.try`, `Action.try`) that normalize runtime failures.
- Updated `@hazel/actors` token validation integration to use explicit `ConfigError` handling (`catchTag`) instead of broad cause inspection.
- Made JWKS loading lazy and config-aware to avoid runtime defects when auth config is incomplete.

### Added

- New test coverage for `packages/rivet-effect` runtime/wrapper/queue behavior.
- New `messageActor.createConnState` tests for invalid token, config-unavailable, bot token success, and JWT success paths.
- `packages/rivet-effect/README.md` and `packages/rivet-effect/MIGRATION.md` with upgrade guidance.
