-- Email invitations to organizations (replacing Clerk invitations): one new table.
--
-- Additive only, in one transaction; safe to apply while the app runs. Generated from the
-- Drizzle schema (packages/db/src/schema/invitations.ts) via pg_dump of a pushed database.
-- Named organization_invitations because prd already has an unrelated `invitations` table.
--
-- Apply: psql "$DIRECT_DATABASE_URL" -v ON_ERROR_STOP=1 -f packages/db/sql/2026-10-13-organization-invitations.sql

BEGIN;

CREATE TABLE public.organization_invitations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "organizationId" uuid NOT NULL,
    email character varying(320) NOT NULL,
    role public.organization_role DEFAULT 'member'::public.organization_role NOT NULL,
    "tokenHash" text NOT NULL,
    "invitedBy" uuid NOT NULL,
    status character varying(16) DEFAULT 'pending'::character varying NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    "acceptedBy" uuid,
    "acceptedAt" timestamp with time zone,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone
);

ALTER TABLE ONLY public.organization_invitations
    ADD CONSTRAINT organization_invitations_pkey PRIMARY KEY (id);

CREATE INDEX organization_invitations_organization_id_idx ON public.organization_invitations USING btree ("organizationId");
CREATE UNIQUE INDEX organization_invitations_pending_email_idx ON public.organization_invitations USING btree ("organizationId", email) WHERE ((status)::text = 'pending'::text);
CREATE UNIQUE INDEX organization_invitations_token_hash_idx ON public.organization_invitations USING btree ("tokenHash");

COMMIT;
