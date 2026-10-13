-- Desktop sign-in through the system browser (@yielded/auth BrowserLogin): one new table.
--
-- Additive only; safe to apply while the app runs. Identical to the library's
-- BrowserLoginPersistence.migration (also declared in packages/db/src/tables/auth.ts).
-- Rows are short-lived handoff attempts and hold no bearer credentials.
--
-- Apply: psql "$DIRECT_DATABASE_URL" -v ON_ERROR_STOP=1 -f packages/db/sql/2026-10-13-desktop-sign-in.sql

BEGIN;

CREATE TABLE IF NOT EXISTS public.yielded_browser_login (
    namespace text NOT NULL,
    attempt_id text NOT NULL,
    version text NOT NULL,
    expires_at_millis bigint NOT NULL,
    payload text NOT NULL,
    CONSTRAINT yielded_browser_login_namespace_attempt_id_pk PRIMARY KEY (namespace, attempt_id)
);


COMMIT;
