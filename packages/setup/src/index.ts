#!/usr/bin/env bun
import { Command } from "@effect/cli"
import { BunContext, BunRuntime } from "@effect/platform-bun"
import { Database } from "@hazel/db"
import { Config, Effect, Layer, Redacted } from "effect"
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
	SecretGenerator.Default,
	CredentialValidator.Default,
	EnvWriter.Default,
	Doctor.Default,
	CertManager.Default,
)

// Database layer for bot creation (reads DATABASE_URL from env)
// Creates database layer if DATABASE_URL is set, otherwise creates an effect layer that will fail when used
const DatabaseLive = Layer.unwrapEffect(
	Effect.gen(function* () {
		const url = yield* Config.redacted("DATABASE_URL").pipe(Config.withDefault(Redacted.make("")))
		const urlValue = Redacted.value(url)

		if (urlValue.length === 0) {
			// Return a layer that fails when Database is accessed
			return Layer.fail(
				new Error("DATABASE_URL not set. Run the 'bots' command with DATABASE_URL set."),
			)
		}

		return Database.layer({
			url,
			ssl: !urlValue.includes("localhost"),
		})
	}),
)

cli(process.argv).pipe(
	Effect.provide(ServicesLive),
	Effect.provide(DatabaseLive),
	Effect.provide(BunContext.layer),
	BunRuntime.runMain,
)
