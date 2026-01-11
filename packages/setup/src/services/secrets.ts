import { Effect } from "effect"

export class SecretGenerator extends Effect.Service<SecretGenerator>()("SecretGenerator", {
	accessors: true,
	effect: Effect.succeed({
		generatePassword: (length: number): string => {
			const bytes = new Uint8Array(length)
			crypto.getRandomValues(bytes)
			return Buffer.from(bytes).toString("base64url").slice(0, length)
		},

		generateEncryptionKey: (): string => {
			const bytes = new Uint8Array(32)
			crypto.getRandomValues(bytes)
			return Buffer.from(bytes).toString("base64")
		},
	}),
}) {}
