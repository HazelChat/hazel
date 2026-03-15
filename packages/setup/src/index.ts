#!/usr/bin/env bun
import { Command } from "effect/unstable/cli"
import { BunContext, BunRuntime } from "@effect/platform-bun"
import { Effect, Layer } from "effect"
import { existsSync, readFileSync } from "fs"
import { resolve } from "path"
import { setupCommand } from "./commands/setup.ts"
import { doctorCommand } from "./commands/doctor.ts"
import { envCommand } from "./commands/env.ts"
import { botsCommand } from "./commands/bots.ts"
import { SecretGenerator } from "./services/secrets.ts"
import { CredentialValidator } from "./services/validators.ts"
import { EnvWriter } from "./services/env-writer.ts"
import { Doctor } from "./services/doctor.ts"
import { certsCommand } from "./commands/certs.ts"
import { CertManager } from "./services/cert-manager.ts"

// Load DATABASE_URL from packages/db/.env if not already set
const loadDatabaseUrl = () => {
	if (process.env.DATABASE_URL) return

	// Try to find and load DATABASE_URL from common locations
	const envPaths = [
		resolve(process.cwd(), "packages/db/.env"),
		resolve(process.cwd(), "apps/backend/.env"),
		resolve(process.cwd(), "../packages/db/.env"),
		resolve(process.cwd(), "../../packages/db/.env"),
	]

	for (const envPath of envPaths) {
		if (existsSync(envPath)) {
			const content = readFileSync(envPath, "utf-8")
			const match = content.match(/^DATABASE_URL=(.+)$/m)
			if (match && match[1] && !match[1].startsWith("#")) {
				process.env.DATABASE_URL = match[1].trim()
				return
			}
		}
	}
}

loadDatabaseUrl()

// Root command with subcommands
const rootCommand = setupCommand.pipe(
	Command.withSubcommands([doctorCommand, envCommand, certsCommand, botsCommand]),
)

const cli = Command.run(rootCommand, {
	name: "hazel-setup",
	version: "0.0.1",
})

const ServicesLive = Layer.mergeAll(
	SecretGenerator.layer,
	CredentialValidator.layer,
	EnvWriter.layer,
	Doctor.layer,
	CertManager.layer,
)

cli(process.argv).pipe(Effect.provide(ServicesLive), Effect.provide(BunContext.layer), BunRuntime.runMain)
