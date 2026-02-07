/**
 * Stub for the "bun" built-in module so Vitest (running under Node) can
 * resolve transitive imports from packages like @hazel/effect-bun.
 *
 * Only the symbols that are actually imported at the top-level are stubbed.
 * Runtime behaviour is always mocked in the individual tests.
 */

export class RedisClient {
	constructor(_url?: string) {}
	connect() {
		return Promise.resolve()
	}
	close() {}
}

export const s3 = new Proxy(
	{},
	{
		get: () => {
			throw new Error("bun S3 stub: not available in test environment")
		},
	},
)
