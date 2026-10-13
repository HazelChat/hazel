-- metadata
CREATE TABLE IF NOT EXISTS "auth_credentials" (
	"credentialId" text NOT NULL,
	"subjectId" uuid NOT NULL,
	"revision" text NOT NULL,
	"active" boolean NOT NULL
);
--> statement-breakpoint
-- metadata
CREATE TABLE IF NOT EXISTS "auth_identifiers" (
	"moduleId" text,
	"credentialId" text,
	"namespace" text NOT NULL,
	"value" text NOT NULL,
	"subjectId" uuid NOT NULL,
	"revision" text NOT NULL,
	"verifiedAt" bigint,
	"active" boolean NOT NULL
);
--> statement-breakpoint
-- metadata
CREATE TABLE IF NOT EXISTS "auth_oauth_flows" (
	"moduleId" text NOT NULL,
	"flowId" text NOT NULL,
	"purpose" text NOT NULL,
	"generation" bigint,
	"provider" text,
	"callbackId" text,
	"issuer" text,
	"responseIssuerMode" text,
	"subjectId" uuid,
	"stateDigest" text,
	"binderVerifier" text,
	"binderExpiresAt" bigint,
	"snapshot" text,
	"issuedAt" bigint,
	"expiresAt" bigint
);
--> statement-breakpoint
-- metadata
CREATE TABLE IF NOT EXISTS "auth_oauth_identities" (
	"identityKey" text NOT NULL,
	"provider" text NOT NULL,
	"issuer" text NOT NULL,
	"externalSubject" text NOT NULL,
	"subjectId" uuid NOT NULL,
	CONSTRAINT "auth_oauth_identities_pkey" PRIMARY KEY ("identityKey")
);
--> statement-breakpoint
-- metadata
CREATE TABLE IF NOT EXISTS "auth_oauth_logins" (
	"moduleId" text NOT NULL,
	"credentialId" text NOT NULL,
	"subjectId" uuid NOT NULL,
	"identityKey" text NOT NULL,
	"credentialRevision" text NOT NULL,
	"status" text NOT NULL,
	CONSTRAINT "auth_oauth_logins_pkey" PRIMARY KEY ("credentialId")
);
--> statement-breakpoint
-- metadata
CREATE TABLE IF NOT EXISTS "auth_oauth_registrations" (
	"moduleId" text NOT NULL,
	"reference" text NOT NULL,
	"flowId" text NOT NULL,
	"identityKey" text,
	"snapshot" text,
	"expiresAt" bigint,
	"retentionUntil" bigint
);
--> statement-breakpoint
-- metadata
CREATE TABLE IF NOT EXISTS "auth_passkey_credentials" (
	"credentialId" text NOT NULL,
	"subjectId" uuid NOT NULL,
	"rpId" text NOT NULL,
	"protocolCredentialId" text NOT NULL,
	"credentialKey" text NOT NULL,
	"userHandle" text NOT NULL,
	"publicKey" text NOT NULL,
	"algorithm" bigint NOT NULL,
	"profile" text NOT NULL,
	"credentialRevision" text NOT NULL,
	"active" boolean NOT NULL,
	"primarySignIn" boolean NOT NULL,
	"enrollmentUserVerified" boolean NOT NULL,
	"backupEligible" boolean NOT NULL,
	"backupState" boolean NOT NULL,
	"counter" bigint NOT NULL,
	"name" text NOT NULL,
	"createdAt" bigint NOT NULL,
	"lastUsedAt" bigint
);
--> statement-breakpoint
-- metadata
CREATE TABLE IF NOT EXISTS "auth_passkey_flows" (
	"moduleId" text NOT NULL,
	"flowId" text NOT NULL,
	"purpose" text NOT NULL,
	"snapshot" text NOT NULL,
	"requestBindingVerifier" text NOT NULL,
	"requestBindingExpiresAt" bigint NOT NULL,
	"issuedAt" bigint NOT NULL,
	"expiresAt" bigint NOT NULL
);
--> statement-breakpoint
-- metadata
CREATE TABLE IF NOT EXISTS "auth_pending" (
	"moduleId" text NOT NULL,
	"kind" text NOT NULL,
	"digest" text NOT NULL,
	"version" text NOT NULL,
	"flowId" text NOT NULL,
	"subjectId" uuid NOT NULL,
	"bindingDigest" text NOT NULL,
	"snapshot" text NOT NULL,
	"expiresAt" bigint NOT NULL,
	"attemptLimit" bigint NOT NULL,
	"failedAttempts" bigint NOT NULL,
	"consumed" boolean NOT NULL
);
--> statement-breakpoint
-- metadata
CREATE TABLE IF NOT EXISTS "auth_sessions" (
	"sessionId" text NOT NULL,
	"subjectId" uuid NOT NULL,
	"digest" text NOT NULL,
	"securityRevision" text NOT NULL,
	"issuedAt" bigint NOT NULL,
	"expiresAt" bigint NOT NULL,
	"absoluteExpiresAt" bigint NOT NULL,
	"record" text NOT NULL
);
--> statement-breakpoint
-- metadata
CREATE TABLE IF NOT EXISTS "organization_invitations" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"organizationId" uuid NOT NULL,
	"email" character varying(320) NOT NULL,
	"role" organization_role NOT NULL DEFAULT 'member',
	"tokenHash" text NOT NULL,
	"invitedBy" uuid NOT NULL,
	"status" character varying(16) NOT NULL DEFAULT 'pending',
	"expiresAt" timestamp with time zone NOT NULL,
	"acceptedBy" uuid,
	"acceptedAt" timestamp with time zone,
	"createdAt" timestamp with time zone NOT NULL DEFAULT now(),
	"updatedAt" timestamp with time zone,
	CONSTRAINT "organization_invitations_pkey" PRIMARY KEY ("id")
);
--> statement-breakpoint
-- metadata
CREATE TABLE IF NOT EXISTS "yielded_browser_login" (
	"namespace" text NOT NULL,
	"attempt_id" text NOT NULL,
	"version" text NOT NULL,
	"expires_at_millis" bigint NOT NULL,
	"payload" text NOT NULL,
	CONSTRAINT "yielded_browser_login_pkey" PRIMARY KEY ("namespace", "attempt_id")
);
--> statement-breakpoint
-- metadata
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "authActive" boolean NOT NULL DEFAULT true;
--> statement-breakpoint
-- metadata
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "securityRevision" text NOT NULL DEFAULT 'initial';
--> statement-breakpoint
-- metadata
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"auth_credentials"'::regclass AND conname = 'auth_credentials_credentialId_unique') THEN
    ALTER TABLE "auth_credentials" ADD CONSTRAINT "auth_credentials_credentialId_unique" UNIQUE ("credentialId");
  END IF;
END $$;
--> statement-breakpoint
-- metadata
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"auth_credentials"'::regclass AND conname = 'auth_credentials_subject_credential') THEN
    ALTER TABLE "auth_credentials" ADD CONSTRAINT "auth_credentials_subject_credential" UNIQUE ("subjectId", "credentialId");
  END IF;
END $$;
--> statement-breakpoint
-- metadata
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"auth_identifiers"'::regclass AND conname = 'auth_identifiers_namespace_value') THEN
    ALTER TABLE "auth_identifiers" ADD CONSTRAINT "auth_identifiers_namespace_value" UNIQUE ("namespace", "value");
  END IF;
END $$;
--> statement-breakpoint
-- metadata
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"auth_oauth_flows"'::regclass AND conname = 'auth_oauth_flows_module_flow') THEN
    ALTER TABLE "auth_oauth_flows" ADD CONSTRAINT "auth_oauth_flows_module_flow" UNIQUE ("moduleId", "flowId");
  END IF;
END $$;
--> statement-breakpoint
-- metadata
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"auth_oauth_flows"'::regclass AND conname = 'auth_oauth_flows_stateDigest_unique') THEN
    ALTER TABLE "auth_oauth_flows" ADD CONSTRAINT "auth_oauth_flows_stateDigest_unique" UNIQUE ("stateDigest");
  END IF;
END $$;
--> statement-breakpoint
-- metadata
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"auth_oauth_logins"'::regclass AND conname = 'auth_oauth_logins_identityKey_unique') THEN
    ALTER TABLE "auth_oauth_logins" ADD CONSTRAINT "auth_oauth_logins_identityKey_unique" UNIQUE ("identityKey");
  END IF;
END $$;
--> statement-breakpoint
-- metadata
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"auth_oauth_registrations"'::regclass AND conname = 'auth_oauth_registrations_module_flow') THEN
    ALTER TABLE "auth_oauth_registrations" ADD CONSTRAINT "auth_oauth_registrations_module_flow" UNIQUE ("moduleId", "flowId");
  END IF;
END $$;
--> statement-breakpoint
-- metadata
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"auth_oauth_registrations"'::regclass AND conname = 'auth_oauth_registrations_module_reference') THEN
    ALTER TABLE "auth_oauth_registrations" ADD CONSTRAINT "auth_oauth_registrations_module_reference" UNIQUE ("moduleId", "reference");
  END IF;
END $$;
--> statement-breakpoint
-- metadata
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"auth_passkey_credentials"'::regclass AND conname = 'auth_passkey_credentials_credentialId_unique') THEN
    ALTER TABLE "auth_passkey_credentials" ADD CONSTRAINT "auth_passkey_credentials_credentialId_unique" UNIQUE ("credentialId");
  END IF;
END $$;
--> statement-breakpoint
-- metadata
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"auth_passkey_credentials"'::regclass AND conname = 'auth_passkey_credentials_credentialKey_unique') THEN
    ALTER TABLE "auth_passkey_credentials" ADD CONSTRAINT "auth_passkey_credentials_credentialKey_unique" UNIQUE ("credentialKey");
  END IF;
END $$;
--> statement-breakpoint
-- metadata
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"auth_passkey_flows"'::regclass AND conname = 'auth_passkey_flows_module_flow') THEN
    ALTER TABLE "auth_passkey_flows" ADD CONSTRAINT "auth_passkey_flows_module_flow" UNIQUE ("moduleId", "flowId");
  END IF;
END $$;
--> statement-breakpoint
-- metadata
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"auth_pending"'::regclass AND conname = 'auth_pending_digest_unique') THEN
    ALTER TABLE "auth_pending" ADD CONSTRAINT "auth_pending_digest_unique" UNIQUE ("digest");
  END IF;
END $$;
--> statement-breakpoint
-- metadata
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"auth_sessions"'::regclass AND conname = 'auth_sessions_digest_unique') THEN
    ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_digest_unique" UNIQUE ("digest");
  END IF;
END $$;
--> statement-breakpoint
-- metadata
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"auth_sessions"'::regclass AND conname = 'auth_sessions_sessionId_unique') THEN
    ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_sessionId_unique" UNIQUE ("sessionId");
  END IF;
END $$;
--> statement-breakpoint
-- metadata
CREATE INDEX IF NOT EXISTS "auth_oauth_identities_subject_idx" ON "auth_oauth_identities" USING btree ("subjectId");
--> statement-breakpoint
-- metadata
CREATE INDEX IF NOT EXISTS "auth_oauth_logins_owner_idx" ON "auth_oauth_logins" USING btree ("identityKey", "subjectId");
--> statement-breakpoint
-- metadata
CREATE INDEX IF NOT EXISTS "auth_passkey_credentials_subject_idx" ON "auth_passkey_credentials" USING btree ("subjectId");
--> statement-breakpoint
-- metadata
CREATE INDEX IF NOT EXISTS "auth_sessions_subject_idx" ON "auth_sessions" USING btree ("subjectId");
--> statement-breakpoint
-- metadata
CREATE INDEX IF NOT EXISTS "organization_invitations_organization_id_idx" ON "organization_invitations" USING btree ("organizationId");
--> statement-breakpoint
-- metadata
CREATE UNIQUE INDEX IF NOT EXISTS "organization_invitations_pending_email_idx" ON "organization_invitations" USING btree ("organizationId", "email") WHERE "status" = 'pending';
--> statement-breakpoint
-- metadata
CREATE UNIQUE INDEX IF NOT EXISTS "organization_invitations_token_hash_idx" ON "organization_invitations" USING btree ("tokenHash");
