import { ServiceMap, Effect } from "effect"

export class SecretGenerator extends ServiceMap.Service<SecretGenerator>()("SecretGenerator", {
	make: Effect.succeed({
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
}) {
	static readonly layer = Layer.effect(this, this.make)
}
