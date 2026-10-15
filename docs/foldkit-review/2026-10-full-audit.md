# Full audit — Foldkit practices, Effect errors, UI state (2026-10-15)

Eight read-only review agents graded `apps/web-foldkit` against Foldkit 0.167.0's own audit spec
(`skills/generate-program/{architecture,conventions,checklist,blindSpots}.md`), the foldkit.dev docs and
exemplars (typing-game, examples/auth, form, job-application), plus the repo's Effect error rules. A ninth
slice covered `apps/backend` error handling. Paths are relative to `apps/web-foldkit/src/` unless prefixed.

Lint baseline: Foldkit plugin is active; 9 errors (2× no-switch-on-message-tag, 2× no-module-level-mutable-state,
2× command-define-pascal-const, 2× command-binding-matches-name, 1× no-hardcoded-route-strings) + 24 warnings.

---

## P0 — User-visible bugs (fix first, small and independent)

| #   | Where                                                                                                                                         | Bug                                                                                                                                                                                                                        | Fix                                                                                                      |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 1   | `app/auth.ts:13-38`                                                                                                                           | API slow/unreachable at boot → `orElseSucceed("SignedOut")` → user bounced to sign-in, never rechecked                                                                                                                     | `FailedCheckSession{reason}`; keep `Loading`/`Unreachable`, retry from update                            |
| 2   | `platform/desktop-auth.ts:64-67,149-156`                                                                                                      | `Effect.promise` around a failing runtime → defect → crash view on desktop boot; failed runtime cached forever                                                                                                             | `tryPromise` + tagged error; don't cache failures                                                        |
| 3   | `app/model.ts:25-28,52-57`                                                                                                                    | Org switch: pages init with new `orgSlug` but old `organization`/`member` (general settings seeds old name, old-org subscription, old role in `can`)                                                                       | `OrgState = Loading{slug} \| Loaded{slug,…}`; only expose when slug matches                              |
| 4   | `mount/message-list.ts:235`, `channel/page.ts:220`                                                                                            | New message while Files tab open → `ApplyScroll` on missing element returns 0 → pages through entire history                                                                                                               | `SkippedApplyScroll`; skip `loadWhenNearEdge` when tab ≠ messages                                        |
| 5   | `page/chat/thread-panel.ts:120`, `channel/view.ts:169`                                                                                        | Images in thread replies can't open; hover toolbar sticks                                                                                                                                                                  | Look up viewer in thread rows too / record source                                                        |
| 6   | `page/chat/banners.ts:45`                                                                                                                     | "Join #channel" button has no handler                                                                                                                                                                                      | `ClickedJoinChannel` + `JoinChannel` Command                                                             |
| 7   | `page/select-organization/update.ts:33`                                                                                                       | "Create a new one" → `/onboarding` → redirected back (loop)                                                                                                                                                                | Navigate to `OnboardingSetupOrganization`                                                                |
| 8   | `auth/flows.ts:18-27`                                                                                                                         | `PasskeyBrowserInputRejected` matches `endsWith("Rejected")` → "sign-in expired"                                                                                                                                           | `AuthFlowError{reason}` built via `catchTags`                                                            |
| 9   | `core/lib/error-messages.ts:209-223,469,517-558`                                                                                              | Still v3 shapes: `reason === "Transport"` never matches v4; no `SchemaError`/`HttpClientError` keys; retry policy says network errors aren't retryable (message sends never retried); raw error/defect text shown to users | Rewrite as `Match.tagsExhaustive` over a typed union; split retry policy; never display unknown messages |
| 10  | `overlay/modal/delete-message.ts:34`                                                                                                          | Delete failure `ignoreCause`d — optimistic rollback with no feedback                                                                                                                                                       | `FailedDeleteMessage`                                                                                    |
| 11  | settings: `chat-sync-connection/update.ts:281,298`, `invitations/update.ts:26`, `connect-invites/update.ts:184`, `connect/share-modal.ts:173` | Load failures render as "not found"/empty                                                                                                                                                                                  | `AsyncData` with Failure + retry                                                                         |
| 12  | `page/profile/model.ts:18`, `page/join/model.ts:11`                                                                                           | `null` = loading and not-found → "User not found"/"Workspace Not Found" flashes; network error looks like bad link                                                                                                         | `AsyncData` / `Loading\|Found\|NotFound\|Failed`                                                         |
| 13  | `my-settings/profile/form.ts:9`                                                                                                               | Shows "firstName must be non-empty"                                                                                                                                                                                        | `fieldValidation` rules with real copy                                                                   |
| 14  | `settings/custom-emojis/update.ts:73-121`                                                                                                     | Every create failure → "name may already be taken"                                                                                                                                                                         | `catchTags`                                                                                              |
| 15  | `channel-settings/overview/update.ts:102`                                                                                                     | Save stays enabled after successful save (defaults never rebased)                                                                                                                                                          | Derive dirty from `values !== defaults`, rebase on success                                               |
| 16  | `composer/composer.ts:168`, `composer/update.ts:72`                                                                                           | Files-tab round-trip loses draft text while "Editing message" survives; submit does nothing                                                                                                                                | Model owns markdown; pass as Mount arg                                                                   |
| 17  | `composer/upload.ts:72-99`                                                                                                                    | XHR not interruptible; switching channel leaves upload running and row never marked failed                                                                                                                                 | `Effect.callback` + abort finalizer + `onInterrupt`                                                      |
| 18  | `emoji-picker/picker.ts:22,175`, `gif-picker/picker.ts:233`                                                                                   | Emoji load failure = permanent spinner; GIF network error = "No GIFs found"                                                                                                                                                | `AsyncData`                                                                                              |
| 19  | `overlay/modal.ts:100`, `modal/contract.ts:96`                                                                                                | Late result from a closed modal drops its toast; reopened modal closed by old instance's success                                                                                                                           | Instance nonce on slot + result                                                                          |
| 20  | `overlay/command-palette/search-update.ts:116-163`                                                                                            | `if` chain whose fall-through clears recent searches                                                                                                                                                                       | `Message.match` exhaustive                                                                               |
| 21  | `ui/switch.ts`, `ui/checkbox.ts`, `ui/tab-strip.ts`, `page/chat/tab-bar.ts`                                                                   | `data-rac` always emitted → no focus ring on 5 switches/2 checkboxes; tab hover never applies                                                                                                                              | Emit `data-rac` only with interaction wiring                                                             |
| 22  | `platform/presence/update.ts:99-109`                                                                                                          | Failed presence send leaves status stuck (sent written before success)                                                                                                                                                     | Set `sent` on success                                                                                    |
| 23  | `gallery/boot.ts:4`                                                                                                                           | Whole gallery (~55 entries, ~2.5k lines kit code) eagerly bundled in prod                                                                                                                                                  | Lazy glob / env gate                                                                                     |
| 24  | `page/chat/channel/write.ts:265,279`                                                                                                          | Thread create/name results ignore their thread id (stale results)                                                                                                                                                          | Compare ids                                                                                              |

## P1 — Effect error architecture (frontend)

The single biggest theme: **failures are caught wholesale and turned into strings/toasts in Commands.**

- ~40 `Effect.catch(() => FailedX())`, ~26 `catchCause(...)`, `String(error)` `reason` payloads nobody reads,
  `_tag`-string sniffing (`composer/draft.ts:208`, `install-bot-by-id.ts:51`, `invite/command.ts`,
  `desktop-handoff.ts`, `detail/command.ts:69`), `Record<string, handler>` in `data/actions.ts:43`.
- Three Failure Message shapes coexist: `Failed*{toast}` (view data in a Message), `Failed*{}`, `Completed*{isX: boolean}`.
- **Target convention:** `Failed*{ reason: <TaggedUnion/Literals> }` built with `Effect.catchTags`; `update` maps reason → copy
  through one rewritten `error-messages.ts`; one `catchCause` only at the shared failure-toast boundary for defects.
- `Effect.promise` where rejection is possible (`session-bearer` via `rpc-auth-middleware.ts:13`, `desktop-menu.ts:21`) → `tryPromise`.
- `crypto.randomUUID() as XId` ×14 in `core/db/actions.ts` → `XId.make(...)`.

## P2 — UI state / Model shape

Recurring Foldkit anti-patterns: boolean soup, nullable-means-loading, derived data stored in the Model, parallel fields.
`AsyncData` and `foldkit/fieldValidation` are used **nowhere** in the app.

- **Root:** `Session = Loading | SignedOut | SignedIn{ user: AsyncData }` (replaces `auth`+`currentUser`+…; also stops the
  endless 10 s `RetryFetchCurrentUser` loop). Drop `pathname` (derive from `route`), route-tag string prefixes
  (`route.ts:334`, `app/view.ts`, subscriptions) → `AppRoute` guards, nav Messages carry `AppRoute` not `href`.
  `menuSignature` cache key out of Model; `isMobile` from Flags at root; one root clock (sidebar has its own 5 s clock).
- **Chat:** thread panel spread over 5 fields + overlays → one `threadPanel` union; tab stored 3 ways → `Tab = Messages | Files{…}`;
  `isSettleWaitPending ≡ isScrolling` → `ScrollPhase`; 6 independent nullable overlays → one `openOverlay` union;
  thread rows unkeyed/unmemoized; reaction buttons unkeyed; module state mutated during render (`rowSlots`, `idleCache`, `draftMappers`).
- **Composer:** `Plain | Replying | Editing` union; `DragState`; Mount arg `isDisabled` treated as reactive (captured once);
  live editor handles in module Maps → `EditorRegistry` Resource with typed `EditorNotMounted`.
- **Onboarding:** `step` + `form` parallel + 5 flags → one union (good `Machine.define` candidate); finalize failure has no retry;
  view/update validation disagree (`"   "`); invite rows keyed by index; dead `Data.emails`; `ClickedBack` stale-result race.
- **Settings/auth forms:** per-form `Submission = NotSubmitted | Submitting | Failed{reason}`; `fieldValidation` rules
  (shared `channelNameRules`); 5 hand-rolled remote-data unions → `AsyncData`; delete-confirm pattern ×5 → one `ConfirmAction` Submodel.
- **Kit:** Slider/Menu/Select/Tabs copy parent data into child Models (`reflectEntries`, `syncVolume`) → ViewInputs;
  Toast lifecycle/timer boolean soup → `Phase`/`Timer` unions; Calendar Range mode is gallery-only → delete;
  `navigator.language` read in view/update (`date-field`, `date-segments`) → locale in Model.

## P3 — Migration cruft to delete

- **effect-atom:** `core/atoms/*` (write-only `emojiUsageAtom`, dead sound atoms), two module `AtomRegistry`s,
  `rpc-atom-client.ts`/`runtime.ts`/`atom-client.ts` (third client stack; **same `"HazelApiClient"` key as `rpc.ts`**),
  `ApiClient`, `telemetry.ts`. Blocker for full removal: `optimisticAction` returns `Atom.fn` (needs an Effect-returning variant).
- **Slate:** viewer still runs on `core/components/chat/slate-editor/*`; composer has ported copies in `editor/`. Point viewer at
  `editor/`, delete `slate-editor/` + `slate` dep (+ ~1000-line duplicate test suite).
- **Rivet:** ManagedResource acquired but never used; `model.rivet` write-only; dead `getAuthenticatedMessageActor`.
- **Notifications:** `diagnostics-store.ts` never read; `sinks/in-app.ts` no-op.
- **Dead variants/fields:** `UpdatedOrgSlug`, `UpdatedMessages`, `messagesStream`, `viewerImageId`, `onRetryAttempt`, `CompletedSignOut`.
- **Kit:** gallery-only components (list-box, table, tree, toggle(-group), input-otp, text, section-footer, form-error-summary,
  field-validation-state, aria/scroll — ~2.5k lines + 1.3k test lines); 9 unused icons; 58 dead `entering:`/`exiting:` classes;
  `@foldkit/ui` dependency is never imported.
- **Hand-rolled framework helpers:** `withCommands` ×5, local `toast` ×7, `merge`, hand-folded children → `Update.combine` /
  `Update.foldChild`; `embedInteraction` ×3 → `Interaction.embed`.
- **Clerk (frontend):** `SignIn`/`SignUp` `splat` route + `redirect_url` for old Clerk links; comments in `db/actions.ts:472`, test names, `docs/foldkit-decisions/s1-skeleton.md`.
- **Stale comments:** "Shared by the React and Foldkit apps" in ~48 style files; `gallery/boot.ts` → `apps/web`.

## P4 — Backend (`apps/backend`) Effect errors

1. **DB error during auth → 401** (`packages/auth/src/consumers/backend-auth.ts:69,132`, `rpc/middleware/auth.ts:84,108`,
   `services/oauth-bearer-auth.ts:67`) — a DB blip signs users out. Map to `SessionLoadError` (503).
2. **`Effect.orDie` across `services/org-resolver.ts`** (10 sites) — guards nearly every RPC; DB errors become defects.
3. **SQL/driver text leaks to clients** — `InternalServerError.cause: Schema.Any` + `String(err)` at ~107 sites. Log cause server-side, send stable message only.
4. **Outbox side effects swallow failures** (`message-side-effect-service.ts:46,167,177,192,207,230`) — retry/backoff never sees them; Discord sync permanently dropped on transient outage.
5. **Clerk webhook returns 200 on failure** (`clerk-sync.ts:275`) — never redelivered.
6. **Validation → 500** (`channels.ts:191,363,450`, `incoming-webhooks.http.ts:96,106,161…`) and **not-found → 500** where `ChannelNotFoundError` etc. exist (`connect-shares.ts:252,619,709,579,762`, `invitations.ts:116` downgrades a specific error).
7. Quality: `Effect.die(new Error(...))` in `bots.ts`, `throw` in `Option.getOrElse`, `new Error(String(cause))` as error type,
   `catchCause` in `yielded/storage.ts:169` falling through to registration (duplicate-account risk; `users.email` not unique),
   GitHub webhook payload cast with `as`, `as any` userId, try/catch around sync decode.
8. **Clerk is half-removed:** backend still requires `CLERK_SECRET_KEY` to boot (`worker/env.ts:29`), Clerk JWT fallback in
   `services/auth.ts:50` + `rpc/middleware/auth.ts:62`, lazy Clerk org-sync per request, webhook route, `ClerkUserFetchError` in
   auth unions, `@clerk/backend` in 4 packages, dead `scripts/migrate-to-clerk/*`. `oauth-bearer-auth.ts` (Maple OAuth via Clerk IdP)
   is a live consumer that needs a replacement first. **CLAUDE.md "Auth: Clerk" and `apps/backendv2` are stale.**

## Deliberate decisions upheld

- Keep hand-rolled virtual message list (Foldkit VirtualList still lacks sticky headers, forces list ARIA) — `s4b-virtual-list.md`.
- Keep local Menu (submenus + context menu), Select, RadioGroup.
- `@foldkit/ui` migrations (Dialog/Popover/Tooltip/Toast/Animation) are blocked on `packages/ui-parity` pinning React Aria DOM.
  Slider and Tabs could migrate now.

## Tooling

- Foldkit DevTools MCP is disabled (`vite.config.ts: devToolsMcpPort: false`) and `@foldkit/devtools-mcp` isn't registered —
  enable both to let agents inspect the live Model / replay Messages.
