#!/usr/bin/env bun
import { Command } from "@effect/cli"
import { BunContext, BunRuntime } from "@effect/platform-bun"
import { Effect, Layer } from "effect"
import { setupCommand } from "./commands/setup.ts"
import { doctorCommand } from "./commands/doctor.ts"
import { envCommand } from "./commands/env.ts"
import { SecretGenerator } from "./services/secrets.ts"
import { CredentialValidator } from "./services/validators.ts"
import { EnvWriter } from "./services/env-writer.ts"
import { Doctor } from "./services/doctor.ts"

// Root command with subcommands
const rootCommand = setupCommand.pipe(Command.withSubcommands([doctorCommand, envCommand]))

const cli = Command.run(rootCommand, {
	name: "hazel-setup",
	version: "0.0.1",
})

const ServicesLive = Layer.mergeAll(
	SecretGenerator.Default,
	CredentialValidator.Default,
	EnvWriter.Default,
	Doctor.Default,
)

cli(process.argv).pipe(Effect.provide(ServicesLive), Effect.provide(BunContext.layer), BunRuntime.runMain)
