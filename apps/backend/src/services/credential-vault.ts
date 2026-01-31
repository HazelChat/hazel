import { Config, Effect, Option, Redacted, Schema } from "effect"

export interface EncryptedCredential {
	ciphertext: string // Base64 encoded
	iv: string // Base64 encoded (12 bytes for AES-GCM)
	keyVersion: number
}

const EncryptionOperation = Schema.Literal("encrypt", "decrypt", "importKey")

export class CredentialEncryptionError extends Schema.TaggedError<CredentialEncryptionError>()(
	"CredentialEncryptionError",
	{
		cause: Schema.Unknown,
		operation: EncryptionOperation,
	},
) {}

export class CredentialKeyVersionNotFoundError extends Schema.TaggedError<CredentialKeyVersionNotFoundError>()(
	"CredentialKeyVersionNotFoundError",
	{
		keyVersion: Schema.Number,
	},
) {}

/**
 * CredentialVault Service
 *
 * Provides encryption/decryption for user API credentials using AES-256-GCM.
 * Supports key rotation with versioned keys.
 *
 * Uses CREDENTIAL_ENCRYPTION_KEY environment variable (base64-encoded 32-byte key).
 */
export class CredentialVault extends Effect.Service<CredentialVault>()("CredentialVault", {
	accessors: true,
	effect: Effect.gen(function* () {
		// Load encryption keys from config (support key rotation)
		const currentKey = yield* Config.redacted("CREDENTIAL_ENCRYPTION_KEY")
		const currentKeyVersion = yield* Config.number("CREDENTIAL_ENCRYPTION_KEY_VERSION").pipe(
			Config.withDefault(1),
		)

		// Optional: Previous key for decryption during rotation
		const previousKey = yield* Config.redacted("CREDENTIAL_ENCRYPTION_KEY_PREV").pipe(
			Config.option,
			Effect.map(Option.getOrUndefined),
		)
		const previousKeyVersion = yield* Config.number("CREDENTIAL_ENCRYPTION_KEY_VERSION_PREV").pipe(
			Config.withDefault(0),
		)

		// Cache for imported crypto keys
		const keyCache = new Map<number, CryptoKey>()

		const importKey = (keyData: Redacted.Redacted<string>, version: number) =>
			Effect.gen(function* () {
				// Check cache first
				const cachedKey = keyCache.get(version)
				if (cachedKey) {
					return cachedKey
				}

				const rawKey = Buffer.from(Redacted.value(keyData), "base64")

				// Validate key length (256 bits = 32 bytes)
				if (rawKey.length !== 32) {
					return yield* Effect.fail(
						new CredentialEncryptionError({
							cause: `Invalid key length: expected 32 bytes, got ${rawKey.length}`,
							operation: "importKey",
						}),
					)
				}

				const cryptoKey = yield* Effect.tryPromise({
					try: () =>
						crypto.subtle.importKey("raw", rawKey, { name: "AES-GCM", length: 256 }, false, [
							"encrypt",
							"decrypt",
						]),
					catch: (cause) => new CredentialEncryptionError({ cause, operation: "importKey" }),
				})

				// Cache the imported key
				keyCache.set(version, cryptoKey)
				return cryptoKey
			})

		/**
		 * Encrypts a plaintext API key.
		 * Returns encrypted data with IV and key version for later decryption.
		 */
		const encrypt = Effect.fn("CredentialVault.encrypt")(function* (plaintext: string) {
			const key = yield* importKey(currentKey, currentKeyVersion)

			// Generate random 12-byte IV for AES-GCM
			const iv = crypto.getRandomValues(new Uint8Array(12))
			const encoded = new TextEncoder().encode(plaintext)

			const ciphertext = yield* Effect.tryPromise({
				try: () =>
					crypto.subtle.encrypt(
						{
							name: "AES-GCM",
							iv,
							tagLength: 128,
						},
						key,
						encoded,
					),
				catch: (cause) => new CredentialEncryptionError({ cause, operation: "encrypt" }),
			})

			return {
				ciphertext: Buffer.from(ciphertext).toString("base64"),
				iv: Buffer.from(iv).toString("base64"),
				keyVersion: currentKeyVersion,
			} satisfies EncryptedCredential
		})

		/**
		 * Decrypts an encrypted credential.
		 * Supports decryption with both current and previous key versions.
		 */
		const decrypt = Effect.fn("CredentialVault.decrypt")(function* (encrypted: EncryptedCredential) {
			// Select key based on version
			let keyData: Redacted.Redacted<string> | undefined
			if (encrypted.keyVersion === currentKeyVersion) {
				keyData = currentKey
			} else if (previousKey && encrypted.keyVersion === previousKeyVersion) {
				keyData = previousKey
			}

			if (!keyData) {
				return yield* Effect.fail(
					new CredentialKeyVersionNotFoundError({ keyVersion: encrypted.keyVersion }),
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
				catch: (cause) => new CredentialEncryptionError({ cause, operation: "decrypt" }),
			})

			return new TextDecoder().decode(plaintext)
		})

		/**
		 * Creates a key hint (last 4 characters) for display purposes.
		 * Returns null if the key is too short.
		 */
		const createKeyHint = (apiKey: string): string | null => {
			if (apiKey.length < 8) {
				return null
			}
			return `...${apiKey.slice(-4)}`
		}

		return {
			encrypt,
			decrypt,
			createKeyHint,
			currentKeyVersion,
		}
	}),
}) {}
