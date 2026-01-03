/**
 * Database Access Layer for Linear Bot
 *
 * Provides access to integration tokens stored in the database.
 */

import { Database, schema } from "@hazel/db"
import type { OrganizationId } from "@hazel/domain/ids"
import { Config, Effect, Layer, Option, Redacted, Schema } from "effect"
import { and, eq, isNull } from "drizzle-orm"

// ============ Error Types ============

export class IntegrationNotConnectedError extends Schema.TaggedError<IntegrationNotConnectedError>()(
	"IntegrationNotConnectedError",
	{
		provider: Schema.String,
	},
) {}

export class IntegrationEncryptionError extends Schema.TaggedError<IntegrationEncryptionError>()(
	"IntegrationEncryptionError",
	{
		cause: Schema.Unknown,
	},
) {}

// ============ Database Layer ============

export const DatabaseLive = Layer.unwrapEffect(
	Effect.gen(function* () {
		const databaseUrl = yield* Config.redacted("DATABASE_URL")
		const isDev = yield* Config.boolean("IS_DEV").pipe(Config.withDefault(true))

		return Database.layer({
			url: databaseUrl,
			ssl: !isDev,
		})
	}),
)

// ============ Encryption Service ============

export class IntegrationEncryption extends Effect.Service<IntegrationEncryption>()("IntegrationEncryption", {
	accessors: true,
	effect: Effect.gen(function* () {
		const currentKey = yield* Config.redacted("INTEGRATION_ENCRYPTION_KEY")
		const currentKeyVersion = yield* Config.number("INTEGRATION_ENCRYPTION_KEY_VERSION").pipe(
			Config.withDefault(1),
		)

		const previousKey = yield* Config.redacted("INTEGRATION_ENCRYPTION_KEY_PREV").pipe(
			Config.option,
			Effect.map(Option.getOrUndefined),
		)
		const previousKeyVersion = yield* Config.number("INTEGRATION_ENCRYPTION_KEY_VERSION_PREV").pipe(
			Config.withDefault(0),
		)

		const keyCache = new Map<number, CryptoKey>()

		const importKey = (keyData: Redacted.Redacted<string>, version: number) =>
			Effect.gen(function* () {
				const cachedKey = keyCache.get(version)
				if (cachedKey) {
					return cachedKey
				}

				const rawKey = Buffer.from(Redacted.value(keyData), "base64")

				if (rawKey.length !== 32) {
					return yield* Effect.fail(
						new IntegrationEncryptionError({
							cause: `Invalid key length: expected 32 bytes, got ${rawKey.length}`,
						}),
					)
				}

				const cryptoKey = yield* Effect.tryPromise({
					try: () =>
						crypto.subtle.importKey("raw", rawKey, { name: "AES-GCM", length: 256 }, false, [
							"encrypt",
							"decrypt",
						]),
					catch: (cause) => new IntegrationEncryptionError({ cause }),
				})

				keyCache.set(version, cryptoKey)
				return cryptoKey
			})

		const decrypt = (encrypted: { ciphertext: string; iv: string; keyVersion: number }) =>
			Effect.gen(function* () {
				let keyData: Redacted.Redacted<string> | undefined
				if (encrypted.keyVersion === currentKeyVersion) {
					keyData = currentKey
				} else if (previousKey && encrypted.keyVersion === previousKeyVersion) {
					keyData = previousKey
				}

				if (!keyData) {
					return yield* Effect.fail(
						new IntegrationEncryptionError({
							cause: `Key version ${encrypted.keyVersion} not found`,
						}),
					)
				}

				const key = yield* importKey(keyData, encrypted.keyVersion)
				const iv = Buffer.from(encrypted.iv, "base64")
				const ciphertext = Buffer.from(encrypted.ciphertext, "base64")

				const plaintext = yield* Effect.tryPromise({
					try: () =>
						crypto.subtle.decrypt(
							{
								name: "AES-GCM",
								iv,
								tagLength: 128,
							},
							key,
							ciphertext,
						),
					catch: (cause) => new IntegrationEncryptionError({ cause }),
				})

				return new TextDecoder().decode(plaintext)
			})

		return { decrypt }
	}),
}) {}

// ============ Token Access ============

/**
 * Get the Linear access token for an organization.
 * Returns the decrypted access token if the org has Linear connected.
 */
export const getLinearAccessToken = (orgId: OrganizationId) =>
	Effect.gen(function* () {
		const db = yield* Database.Database
		const encryption = yield* IntegrationEncryption

		// Find the org's Linear connection using the Effect-based execute API
		const connections = yield* db.execute((client) =>
			client
				.select()
				.from(schema.integrationConnectionsTable)
				.where(
					and(
						eq(schema.integrationConnectionsTable.organizationId, orgId),
						eq(schema.integrationConnectionsTable.provider, "linear"),
						isNull(schema.integrationConnectionsTable.userId),
						eq(schema.integrationConnectionsTable.level, "organization"),
						isNull(schema.integrationConnectionsTable.deletedAt),
					),
				)
				.limit(1),
		)

		const connection = connections[0]
		if (!connection) {
			return yield* Effect.fail(new IntegrationNotConnectedError({ provider: "linear" }))
		}

		if (connection.status !== "active") {
			return yield* Effect.fail(new IntegrationNotConnectedError({ provider: "linear" }))
		}

		// Find the token for this connection
		const tokens = yield* db.execute((client) =>
			client
				.select()
				.from(schema.integrationTokensTable)
				.where(eq(schema.integrationTokensTable.connectionId, connection.id))
				.limit(1),
		)

		const token = tokens[0]
		if (!token) {
			return yield* Effect.fail(new IntegrationNotConnectedError({ provider: "linear" }))
		}

		// Decrypt and return the access token
		const accessToken = yield* encryption
			.decrypt({
				ciphertext: token.encryptedAccessToken,
				iv: token.iv,
				keyVersion: token.encryptionKeyVersion,
			})
			.pipe(
				Effect.catchAll(() => Effect.fail(new IntegrationNotConnectedError({ provider: "linear" }))),
			)

		return accessToken
	})

// ============ Layer Composition ============

export const IntegrationLayerLive = Layer.mergeAll(DatabaseLive, IntegrationEncryption.Default)
