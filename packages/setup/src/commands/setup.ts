import { Command, Options, Prompt } from "@effect/cli"
import { Console, Effect, Redacted } from "effect"
import pc from "picocolors"
import { SecretGenerator } from "../services/secrets.ts"
import { CredentialValidator } from "../services/validators.ts"
import { EnvWriter, type EnvReadResult } from "../services/env-writer.ts"
import { Doctor } from "../services/doctor.ts"
import {
	ENV_TEMPLATES,
	getLocalMinioConfig,
	extractExistingConfig,
	maskSecret,
	type Config,
} from "../templates.ts"
import { promptWithExisting, getExistingValue } from "../prompts.ts"

// CLI Options
const skipValidation = Options.boolean("skip-validation").pipe(
	Options.withDescription("Skip credential validation (API calls)"),
	Options.withDefault(false),
)

const force = Options.boolean("force").pipe(
	Options.withAlias("f"),
	Options.withDescription("Overwrite existing .env files without prompting"),
	Options.withDefault(false),
)

const dryRun = Options.boolean("dry-run").pipe(
	Options.withAlias("n"),
	Options.withDescription("Show what would be done without writing files"),
	Options.withDefault(false),
)

const skipDoctor = Options.boolean("skip-doctor").pipe(
	Options.withDescription("Skip environment checks"),
	Options.withDefault(false),
)

export const setupCommand = Command.make(
	"setup",
	{ skipValidation, force, dryRun, skipDoctor },
	({ skipValidation, force, dryRun, skipDoctor }) =>
		Effect.gen(function* () {
			yield* Console.log(`\n${pc.bold("\u{1F33F} Hazel Local Development Setup")}\n`)

			// Start Docker Compose first
			yield* Console.log(pc.cyan("\u2500\u2500\u2500 Starting Docker Compose \u2500\u2500\u2500"))
			yield* Console.log(pc.dim("Running `docker compose up -d`...\n"))

			const composeResult = yield* Effect.tryPromise({
				try: async () => {
					const proc = Bun.spawn(["docker", "compose", "up", "-d"], {
						stdout: "pipe",
						stderr: "pipe",
					})
					await proc.exited
					return proc.exitCode === 0
				},
				catch: () => false,
			}).pipe(Effect.catchAll(() => Effect.succeed(false)))

			if (composeResult) {
				yield* Console.log(pc.green("\u2713") + " Docker Compose started\n")
			} else {
				yield* Console.log(pc.yellow("\u26A0") + " Failed to start Docker Compose")
				const continueAnyway = yield* Prompt.confirm({
					message: "Continue anyway?",
					initial: false,
				})
				if (!continueAnyway) return
				yield* Console.log("")
			}

			// Run doctor first (unless skipped)
			if (!skipDoctor) {
				const doctor = yield* Doctor
				const { environment, services } = yield* doctor.runAllChecks()
				const allResults = [...environment, ...services]

				const formatResult = (result: { name: string; status: string; message: string }) => {
					const icon =
						result.status === "ok"
							? pc.green("\u2713")
							: result.status === "warn"
								? pc.yellow("\u26A0")
								: pc.red("\u2717")
					const msg =
						result.status === "fail"
							? pc.red(result.message)
							: result.status === "warn"
								? pc.yellow(result.message)
								: result.message
					return `  ${icon} ${pc.bold(result.name)}: ${msg}`
				}

				yield* Console.log(pc.cyan("\u2500\u2500\u2500 Environment \u2500\u2500\u2500"))
				for (const result of environment) {
					yield* Console.log(formatResult(result))
				}

				yield* Console.log(pc.cyan("\n\u2500\u2500\u2500 Services \u2500\u2500\u2500"))
				for (const result of services) {
					yield* Console.log(formatResult(result))
				}

				const hasFailure = allResults.some((r) => r.status === "fail")
				if (hasFailure) {
					yield* Console.log(
						`\n${pc.yellow("\u26A0 Some checks failed.")} Run ${pc.cyan("`hazel-setup doctor`")} for details.`,
					)
					const continueAnyway = yield* Prompt.confirm({
						message: "Continue anyway?",
						initial: false,
					})
					if (!continueAnyway) return
				}
				yield* Console.log("")
			}

			// Get services
			const envWriter = yield* EnvWriter
			const secrets = yield* SecretGenerator

			// Read existing .env files for smart prefilling
			const envResult = yield* envWriter.readAllEnvFiles()
			const existingConfig = extractExistingConfig(envResult)
			const hasExistingValues = Object.keys(envResult.values).length > 0

			// Check for existing .env files
			const hasExisting = yield* envWriter.envFileExists("apps/backend/.env")

			if (hasExisting && !force) {
				if (hasExistingValues) {
					yield* Console.log(pc.cyan("Found existing configuration - values will be prefilled"))
				}
				const overwrite = yield* Prompt.confirm({
					message: "Existing .env files found. Overwrite?",
					initial: hasExistingValues, // Default to yes if we found existing values to prefill
				})
				if (!overwrite) {
					yield* Console.log(pc.dim("Setup cancelled."))
					return
				}
			}

			// Step 1: Local services info
			yield* Console.log(
				pc.cyan("\u2500\u2500\u2500 Step 1: Database & Local Services \u2500\u2500\u2500"),
			)
			yield* Console.log("Using Docker Compose defaults:")
			yield* Console.log(pc.dim("  \u2022 PostgreSQL: postgresql://user:password@localhost:5432/app"))
			yield* Console.log(pc.dim("  \u2022 Redis: redis://localhost:6380"))
			yield* Console.log(pc.dim("  \u2022 Electric: http://localhost:3333\n"))

			// Validate database connection
			if (!skipValidation) {
				const validator = yield* CredentialValidator
				const dbResult = yield* validator
					.validateDatabase("postgresql://user:password@localhost:5432/app")
					.pipe(Effect.either)

				if (dbResult._tag === "Left") {
					yield* Console.log(
						pc.yellow("\u26A0\uFE0F  Database not reachable.") +
							` Run ${pc.cyan("`docker compose up -d`")} first.`,
					)
					const continueAnyway = yield* Prompt.confirm({
						message: "Continue anyway?",
						initial: true,
					})
					if (!continueAnyway) return
				} else {
					yield* Console.log(pc.green("\u2713") + " Database connected\n")
				}
			}

			// Step 2: WorkOS setup
			yield* Console.log(pc.cyan("\u2500\u2500\u2500 Step 2: WorkOS Authentication \u2500\u2500\u2500"))
			yield* Console.log("WorkOS provides user authentication.")
			if (!existingConfig.workosApiKey) {
				yield* Console.log(`Create a free account at ${pc.cyan("https://dashboard.workos.com")}\n`)
				yield* Console.log(pc.dim("1. Create a new project"))
				yield* Console.log(pc.dim("2. Go to API Keys \u2192 copy your API key (sk_test_...)"))
				yield* Console.log(pc.dim("3. Go to Configuration \u2192 copy Client ID (client_...)"))
				yield* Console.log(pc.dim("4. Add redirect URI: http://localhost:3003/auth/callback\n"))
			} else {
				yield* Console.log(
					pc.dim("(Using existing credentials - press Enter to keep or type new value)\n"),
				)
			}

			const workosApiKey = yield* promptWithExisting({
				key: "WORKOS_API_KEY",
				message: "Enter your WorkOS API Key",
				envResult,
				validate: (s) =>
					s.startsWith("sk_") ? Effect.succeed(s) : Effect.fail("Must start with sk_"),
				isSecret: true,
			})

			const workosClientId = yield* promptWithExisting({
				key: "WORKOS_CLIENT_ID",
				message: "Enter your WorkOS Client ID",
				envResult,
				validate: (s) =>
					s.startsWith("client_") ? Effect.succeed(s) : Effect.fail("Must start with client_"),
			})

			// Validate WorkOS credentials
			if (!skipValidation) {
				yield* Console.log(pc.dim("\nValidating WorkOS credentials..."))
				const validator = yield* CredentialValidator
				const result = yield* validator
					.validateWorkOS(workosApiKey, workosClientId)
					.pipe(Effect.either)

				if (result._tag === "Left") {
					yield* Console.log(pc.red(`\u274C WorkOS validation failed: ${result.left.message}`))
					yield* Console.log(pc.dim("Please check your credentials and try again."))
					return
				}
				yield* Console.log(pc.green("\u2713") + " WorkOS credentials valid\n")
			}

			// Step 3: Secrets - reuse existing or generate new
			yield* Console.log(pc.cyan("\u2500\u2500\u2500 Step 3: Secrets \u2500\u2500\u2500"))

			const existingCookiePassword = getExistingValue(envResult, "WORKOS_COOKIE_PASSWORD")
			const existingEncryptionKey = getExistingValue(envResult, "INTEGRATION_ENCRYPTION_KEY")

			const generatedSecrets = {
				cookiePassword: existingCookiePassword?.value ?? secrets.generatePassword(32),
				encryptionKey: existingEncryptionKey?.value ?? secrets.generateEncryptionKey(),
			}

			if (existingCookiePassword) {
				yield* Console.log(
					pc.green("\u2713") +
						` Reusing WORKOS_COOKIE_PASSWORD (from ${existingCookiePassword.source})`,
				)
			} else {
				yield* Console.log(pc.green("\u2713") + " Generated WORKOS_COOKIE_PASSWORD")
			}

			if (existingEncryptionKey) {
				yield* Console.log(
					pc.green("\u2713") +
						` Reusing INTEGRATION_ENCRYPTION_KEY (from ${existingEncryptionKey.source})`,
				)
			} else {
				yield* Console.log(pc.green("\u2713") + " Generated INTEGRATION_ENCRYPTION_KEY")
			}
			yield* Console.log("")

			// Step 4: S3 Storage (local MinIO)
			yield* Console.log(pc.cyan("\u2500\u2500\u2500 Step 4: S3 Storage \u2500\u2500\u2500"))
			yield* Console.log(pc.green("\u2713") + " Using local MinIO (Docker Compose)")
			yield* Console.log(pc.dim("  Console: http://localhost:9001 (minioadmin/minioadmin)\n"))

			const s3Config = getLocalMinioConfig()

			// Optional: Linear OAuth
			yield* Console.log(pc.cyan("\u2500\u2500\u2500 Optional: Linear Integration \u2500\u2500\u2500"))

			let linearConfig: { clientId: string; clientSecret: string } | undefined

			// Check if Linear is already configured
			if (existingConfig.linear) {
				yield* Console.log(pc.green("\u2713") + " Found existing Linear configuration")
				yield* Console.log(pc.dim(`  CLIENT_ID: ${maskSecret(existingConfig.linear.clientId.value)}`))
				const keepLinear = yield* Prompt.confirm({
					message: "Keep existing Linear configuration?",
					initial: true,
				})
				if (keepLinear) {
					linearConfig = {
						clientId: existingConfig.linear.clientId.value,
						clientSecret: existingConfig.linear.clientSecret.value,
					}
				}
			}

			if (!linearConfig) {
				const setupLinear = yield* Prompt.confirm({
					message: "Set up Linear OAuth? (for Linear integration)",
					initial: false,
				})

				if (setupLinear) {
					yield* Console.log(
						`Create a Linear OAuth app at ${pc.cyan("https://linear.app/settings/api")}`,
					)
					yield* Console.log(
						pc.dim("Set redirect URI: http://localhost:3003/integrations/linear/callback\n"),
					)

					const clientId = yield* promptWithExisting({
						key: "LINEAR_CLIENT_ID",
						message: "Linear Client ID",
						envResult,
					})
					const clientSecret = yield* promptWithExisting({
						key: "LINEAR_CLIENT_SECRET",
						message: "Linear Client Secret",
						envResult,
						isSecret: true,
					})
					linearConfig = { clientId, clientSecret }
				}
			}

			// Optional: GitHub Integration
			yield* Console.log(
				pc.cyan("\n\u2500\u2500\u2500 Optional: GitHub Integration \u2500\u2500\u2500"),
			)

			let githubAppConfig: { appId: string; appSlug: string; privateKey: string } | undefined
			let githubWebhookSecret: string | undefined

			// Check if GitHub App is already configured
			if (existingConfig.githubApp) {
				yield* Console.log(pc.green("\u2713") + " Found existing GitHub App configuration")
				yield* Console.log(pc.dim(`  App ID: ${existingConfig.githubApp.appId.value}`))
				const keepGithubApp = yield* Prompt.confirm({
					message: "Keep existing GitHub App configuration?",
					initial: true,
				})
				if (keepGithubApp) {
					githubAppConfig = {
						appId: existingConfig.githubApp.appId.value,
						appSlug: existingConfig.githubApp.appSlug.value,
						privateKey: existingConfig.githubApp.privateKey.value,
					}
				}
			}

			if (!githubAppConfig) {
				const setupGithubApp = yield* Prompt.confirm({
					message: "Set up GitHub App? (for GitHub integration)",
					initial: false,
				})

				if (setupGithubApp) {
					yield* Console.log(
						`Create a GitHub App at ${pc.cyan("https://github.com/settings/apps/new")}`,
					)
					yield* Console.log(pc.dim("1. Note the App ID from the app settings page"))
					yield* Console.log(pc.dim("2. Note the app slug from the URL"))
					yield* Console.log(pc.dim("3. Generate and download a private key"))
					yield* Console.log(
						pc.dim("4. Base64-encode the private key: base64 -i private-key.pem\n"),
					)

					const appId = yield* promptWithExisting({
						key: "GITHUB_APP_ID",
						message: "GitHub App ID",
						envResult,
					})
					const appSlug = yield* promptWithExisting({
						key: "GITHUB_APP_SLUG",
						message: "GitHub App Slug",
						envResult,
					})
					const privateKey = yield* promptWithExisting({
						key: "GITHUB_APP_PRIVATE_KEY",
						message: "GitHub App Private Key (base64-encoded)",
						envResult,
						isSecret: true,
					})

					githubAppConfig = { appId, appSlug, privateKey }
				}
			}

			// Check if GitHub webhook secret is already configured
			if (existingConfig.githubWebhookSecret) {
				yield* Console.log(pc.green("\u2713") + " Found existing GitHub webhook secret")
				const keepGithub = yield* Prompt.confirm({
					message: "Keep existing GitHub webhook secret?",
					initial: true,
				})
				if (keepGithub) {
					githubWebhookSecret = existingConfig.githubWebhookSecret.value
				}
			}

			if (!githubWebhookSecret) {
				const setupGithub = yield* Prompt.confirm({
					message: "Set up GitHub webhook secret?",
					initial: false,
				})

				if (setupGithub) {
					yield* Console.log(pc.dim("Generate a random secret for GitHub webhook verification\n"))
					const useGenerated = yield* Prompt.confirm({
						message: "Auto-generate a secure secret?",
						initial: true,
					})

					if (useGenerated) {
						githubWebhookSecret = secrets.generatePassword(32)
						yield* Console.log(`Generated: ${pc.cyan(githubWebhookSecret)}`)
						yield* Console.log(pc.dim("Save this for your GitHub webhook configuration\n"))
					} else {
						const secretRedacted = yield* Prompt.password({ message: "GitHub Webhook Secret" })
						githubWebhookSecret = Redacted.value(secretRedacted)
					}
				}
			}

			// Optional: OpenRouter API
			yield* Console.log(pc.cyan("\n\u2500\u2500\u2500 Optional: AI Features \u2500\u2500\u2500"))

			let openrouterApiKey: string | undefined

			// Check if OpenRouter is already configured
			if (existingConfig.openrouterApiKey) {
				yield* Console.log(pc.green("\u2713") + " Found existing OpenRouter API key")
				const keepOpenRouter = yield* Prompt.confirm({
					message: "Keep existing OpenRouter API key?",
					initial: true,
				})
				if (keepOpenRouter) {
					openrouterApiKey = existingConfig.openrouterApiKey.value
				}
			}

			if (!openrouterApiKey) {
				const setupOpenRouter = yield* Prompt.confirm({
					message: "Set up OpenRouter API? (for AI thread naming)",
					initial: false,
				})

				if (setupOpenRouter) {
					yield* Console.log(`Get your API key at ${pc.cyan("https://openrouter.ai/keys")}\n`)
					openrouterApiKey = yield* promptWithExisting({
						key: "OPENROUTER_API_KEY",
						message: "OpenRouter API Key",
						envResult,
						isSecret: true,
					})
				}
			}

			// Step 5: Write .env files
			if (dryRun) {
				yield* Console.log(
					pc.cyan("\n\u2500\u2500\u2500 Step 5: Preview .env files (dry-run) \u2500\u2500\u2500"),
				)
			} else {
				yield* Console.log(
					pc.cyan("\n\u2500\u2500\u2500 Step 5: Writing .env files \u2500\u2500\u2500"),
				)
			}

			const config: Config = {
				workosApiKey,
				workosClientId,
				secrets: generatedSecrets,
				s3: s3Config,
				s3PublicUrl: s3Config.publicUrl,
				linear: linearConfig,
				githubApp: githubAppConfig,
				githubWebhookSecret,
				openrouterApiKey,
			}

			yield* envWriter.writeEnvFile("apps/web/.env", ENV_TEMPLATES.web(config), dryRun)
			yield* envWriter.writeEnvFile("apps/backend/.env", ENV_TEMPLATES.backend(config), dryRun)
			yield* envWriter.writeEnvFile("apps/cluster/.env", ENV_TEMPLATES.cluster(config), dryRun)
			yield* envWriter.writeEnvFile(
				"apps/electric-proxy/.env",
				ENV_TEMPLATES.electricProxy(config),
				dryRun,
			)
			yield* envWriter.writeEnvFile("packages/db/.env", ENV_TEMPLATES.db(), dryRun)

			if (dryRun) {
				yield* Console.log(pc.dim("\nDry-run complete! No files were written."))
				yield* Console.log(`Run without ${pc.cyan("--dry-run")} to apply these changes.\n`)
			} else {
				// Run db:push to initialize database schema
				yield* Console.log(
					pc.cyan("\n\u2500\u2500\u2500 Step 6: Initialize Database \u2500\u2500\u2500"),
				)
				yield* Console.log(pc.dim("Running `bun run db:push`...\n"))

				const dbPushResult = yield* Effect.tryPromise({
					try: async () => {
						const proc = Bun.spawn(["bun", "run", "db:push"], {
							cwd: process.cwd() + "/packages/db",
							stdout: "inherit",
							stderr: "inherit",
						})
						await proc.exited
						return proc.exitCode === 0
					},
					catch: () => false,
				}).pipe(Effect.catchAll(() => Effect.succeed(false)))

				if (dbPushResult) {
					yield* Console.log(pc.green("\n\u2713") + " Database schema pushed")
				} else {
					yield* Console.log(
						pc.yellow("\n\u26A0") + " Database push failed. You may need to run it manually.",
					)
				}

				yield* Console.log(pc.green("\n\u2705 Setup complete!"))
				yield* Console.log(pc.bold("Next step:"))
				yield* Console.log(`  Run ${pc.cyan("`bun run dev`")} to start developing\n`)
			}
		}),
)
