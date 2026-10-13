import { UserId } from "@hazel/schema"
import * as PG from "@maple-dev/effect-orm/postgres"
import { uuid } from "./columns"

/** Auth storage metadata. The additive SQL migrations create these tables. */
export const authCredentialsTable = PG.table("auth_credentials", {
	columns: {
		credentialId: PG.text,
		subjectId: uuid(UserId),
		revision: PG.text,
		active: PG.bool,
	},
	uniqueConstraints: [
		PG.unique("auth_credentials_credentialId_unique", ["credentialId"]),
		PG.unique("auth_credentials_subject_credential", ["subjectId", "credentialId"]),
	],
})

export const authIdentifiersTable = PG.table("auth_identifiers", {
	columns: {
		moduleId: PG.nullable(PG.text),
		credentialId: PG.nullable(PG.text),
		namespace: PG.text,
		value: PG.text,
		subjectId: uuid(UserId),
		revision: PG.text,
		verifiedAt: PG.nullable(PG.int8),
		active: PG.bool,
	},
	uniqueConstraints: [PG.unique("auth_identifiers_namespace_value", ["namespace", "value"])],
})

export const authSessionsTable = PG.table("auth_sessions", {
	columns: {
		sessionId: PG.text,
		subjectId: uuid(UserId),
		digest: PG.text,
		securityRevision: PG.text,
		issuedAt: PG.int8,
		expiresAt: PG.int8,
		absoluteExpiresAt: PG.int8,
		record: PG.text,
	},
	uniqueConstraints: [
		PG.unique("auth_sessions_sessionId_unique", ["sessionId"]),
		PG.unique("auth_sessions_digest_unique", ["digest"]),
	],
	indexes: [PG.index("auth_sessions_subject_idx", ["subjectId"])],
})

export const authPendingTable = PG.table("auth_pending", {
	columns: {
		moduleId: PG.text,
		kind: PG.text,
		digest: PG.text,
		version: PG.text,
		flowId: PG.text,
		subjectId: uuid(UserId),
		bindingDigest: PG.text,
		snapshot: PG.text,
		expiresAt: PG.int8,
		attemptLimit: PG.int8,
		failedAttempts: PG.int8,
		consumed: PG.bool,
	},
	uniqueConstraints: [PG.unique("auth_pending_digest_unique", ["digest"])],
})

export const authPasskeyCredentialsTable = PG.table("auth_passkey_credentials", {
	columns: {
		credentialId: PG.text,
		subjectId: uuid(UserId),
		rpId: PG.text,
		protocolCredentialId: PG.text,
		credentialKey: PG.text,
		userHandle: PG.text,
		publicKey: PG.text,
		algorithm: PG.int8,
		profile: PG.text,
		credentialRevision: PG.text,
		active: PG.bool,
		primarySignIn: PG.bool,
		enrollmentUserVerified: PG.bool,
		backupEligible: PG.bool,
		backupState: PG.bool,
		counter: PG.int8,
		name: PG.text,
		createdAt: PG.int8,
		lastUsedAt: PG.nullable(PG.int8),
	},
	uniqueConstraints: [
		PG.unique("auth_passkey_credentials_credentialId_unique", ["credentialId"]),
		PG.unique("auth_passkey_credentials_credentialKey_unique", ["credentialKey"]),
	],
	indexes: [PG.index("auth_passkey_credentials_subject_idx", ["subjectId"])],
})

export const authPasskeyFlowsTable = PG.table("auth_passkey_flows", {
	columns: {
		moduleId: PG.text,
		flowId: PG.text,
		purpose: PG.text,
		snapshot: PG.text,
		requestBindingVerifier: PG.text,
		requestBindingExpiresAt: PG.int8,
		issuedAt: PG.int8,
		expiresAt: PG.int8,
	},
	uniqueConstraints: [PG.unique("auth_passkey_flows_module_flow", ["moduleId", "flowId"])],
})

export const authOAuthIdentitiesTable = PG.table("auth_oauth_identities", {
	columns: {
		identityKey: PG.text,
		provider: PG.text,
		issuer: PG.text,
		externalSubject: PG.text,
		subjectId: uuid(UserId),
	},
	primaryKey: ["identityKey"],
	indexes: [PG.index("auth_oauth_identities_subject_idx", ["subjectId"])],
})

export const authOAuthLoginsTable = PG.table("auth_oauth_logins", {
	columns: {
		moduleId: PG.text,
		credentialId: PG.text,
		subjectId: uuid(UserId),
		identityKey: PG.text,
		credentialRevision: PG.text,
		status: PG.text,
	},
	primaryKey: ["credentialId"],
	uniqueConstraints: [PG.unique("auth_oauth_logins_identityKey_unique", ["identityKey"])],
	indexes: [PG.index("auth_oauth_logins_owner_idx", ["identityKey", "subjectId"])],
})

export const authOAuthFlowsTable = PG.table("auth_oauth_flows", {
	columns: {
		moduleId: PG.text,
		flowId: PG.text,
		purpose: PG.text,
		generation: PG.nullable(PG.int8),
		provider: PG.nullable(PG.text),
		callbackId: PG.nullable(PG.text),
		issuer: PG.nullable(PG.text),
		responseIssuerMode: PG.nullable(PG.text),
		subjectId: PG.nullable(uuid(UserId)),
		stateDigest: PG.nullable(PG.text),
		binderVerifier: PG.nullable(PG.text),
		binderExpiresAt: PG.nullable(PG.int8),
		snapshot: PG.nullable(PG.text),
		issuedAt: PG.nullable(PG.int8),
		expiresAt: PG.nullable(PG.int8),
	},
	uniqueConstraints: [
		PG.unique("auth_oauth_flows_stateDigest_unique", ["stateDigest"]),
		PG.unique("auth_oauth_flows_module_flow", ["moduleId", "flowId"]),
	],
})

export const authOAuthRegistrationsTable = PG.table("auth_oauth_registrations", {
	columns: {
		moduleId: PG.text,
		reference: PG.text,
		flowId: PG.text,
		identityKey: PG.nullable(PG.text),
		snapshot: PG.nullable(PG.text),
		expiresAt: PG.nullable(PG.int8),
		retentionUntil: PG.nullable(PG.int8),
	},
	uniqueConstraints: [
		PG.unique("auth_oauth_registrations_module_reference", ["moduleId", "reference"]),
		PG.unique("auth_oauth_registrations_module_flow", ["moduleId", "flowId"]),
	],
})

export const yieldedBrowserLoginTable = PG.table("yielded_browser_login", {
	columns: {
		namespace: PG.text,
		attempt_id: PG.text,
		version: PG.text,
		expires_at_millis: PG.int8,
		payload: PG.text,
	},
	primaryKey: ["namespace", "attempt_id"],
})
