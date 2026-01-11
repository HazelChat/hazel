import { Effect } from "effect"
import { resolve } from "node:path"

export interface CertPaths {
	cert: string
	key: string
}

// Find repo root by looking for turbo.json
const findRepoRoot = (): string => {
	let dir = process.cwd()
	while (dir !== "/") {
		if (Bun.file(resolve(dir, "turbo.json")).size > 0) return dir
		dir = resolve(dir, "..")
	}
	return process.cwd()
}

export class CertManager extends Effect.Service<CertManager>()("CertManager", {
	accessors: true,
	effect: Effect.succeed({
		get certsDir() {
			return resolve(findRepoRoot(), "certs")
		},

		get certPath() {
			return resolve(this.certsDir, "localhost.pem")
		},

		get keyPath() {
			return resolve(this.certsDir, "localhost-key.pem")
		},

		certsExist: () =>
			Effect.promise(async () => {
				const certsDir = resolve(findRepoRoot(), "certs")
				const [certExists, keyExists] = await Promise.all([
					Bun.file(resolve(certsDir, "localhost.pem")).exists(),
					Bun.file(resolve(certsDir, "localhost-key.pem")).exists(),
				])
				return certExists && keyExists
			}),

		checkMkcert: () =>
			Effect.tryPromise({
				try: async () => {
					const proc = Bun.spawn(["mkcert", "-help"], {
						stdout: "ignore",
						stderr: "ignore",
					})
					return (await proc.exited) === 0
				},
				catch: () => new Error("mkcert check failed"),
			}).pipe(Effect.catchAll(() => Effect.succeed(false))),

		installMkcert: () =>
			Effect.tryPromise({
				try: async () => {
					const proc = Bun.spawn(["brew", "install", "mkcert"], {
						stdout: "inherit",
						stderr: "inherit",
					})
					if ((await proc.exited) !== 0) {
						throw new Error("Failed to install mkcert")
					}
				},
				catch: (e) => new Error(`Install failed: ${e}`),
			}),

		installCA: () =>
			Effect.tryPromise({
				try: async () => {
					const proc = Bun.spawn(["mkcert", "-install"], {
						stdout: "inherit",
						stderr: "inherit",
					})
					if ((await proc.exited) !== 0) {
						throw new Error("Failed to install CA")
					}
				},
				catch: (e) => new Error(`CA install failed: ${e}`),
			}),

		generateCerts: () =>
			Effect.tryPromise({
				try: async () => {
					const certsDir = resolve(findRepoRoot(), "certs")
					await Bun.$`mkdir -p ${certsDir}`
					const proc = Bun.spawn(
						[
							"mkcert",
							"-key-file",
							resolve(certsDir, "localhost-key.pem"),
							"-cert-file",
							resolve(certsDir, "localhost.pem"),
							"localhost",
							"127.0.0.1",
							"::1",
						],
						{ stdout: "inherit", stderr: "inherit" },
					)
					if ((await proc.exited) !== 0) {
						throw new Error("Failed to generate certificates")
					}
				},
				catch: (e) => new Error(`Cert generation failed: ${e}`),
			}),
	}),
}) {}
