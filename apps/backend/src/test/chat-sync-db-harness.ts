import { execSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql"
import { Database } from "@hazel/db"
import { Effect, Layer, Redacted } from "effect"

const DB_PACKAGE_DIR = fileURLToPath(new URL("../../../../packages/db", import.meta.url))

const TRUNCATE_SQL = `
TRUNCATE TABLE
	chat_sync_event_receipts,
	chat_sync_message_links,
	chat_sync_channel_links,
	chat_sync_connections,
	message_reactions,
	messages,
	channels,
	organization_members,
	integration_connections,
	users,
	organizations
RESTART IDENTITY CASCADE;
`

export interface ChatSyncDbHarness {
	readonly container: StartedPostgreSqlContainer
	readonly dbLayer: Layer.Layer<Database.Database>
	run: <A, E, R>(effect: Effect.Effect<A, E, R>) => Promise<A>
	reset: () => Promise<void>
	stop: () => Promise<void>
}

const runDbPush = (databaseUrl: string) => {
	execSync("bun run db:push", {
		cwd: DB_PACKAGE_DIR,
		stdio: "pipe",
		env: {
			...process.env,
			DATABASE_URL: databaseUrl,
		},
	})
}

export const createChatSyncDbHarness = async (): Promise<ChatSyncDbHarness> => {
	const container = await new PostgreSqlContainer("postgres:alpine").start()
	const databaseUrl = container.getConnectionUri()

	runDbPush(databaseUrl)

	const dbLayer = Database.layer({
		url: Redacted.make(databaseUrl),
		ssl: false,
	})

	const run = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
		Effect.runPromise(
			(effect as Effect.Effect<A, E, never>).pipe(Effect.provide(dbLayer), Effect.scoped),
		)

	const reset = () =>
		run(
			Effect.gen(function* () {
				const db = yield* Database.Database
				yield* db.execute((client) => client.$client.unsafe(TRUNCATE_SQL))
			}),
		)

	const stop = async () => {
		await container.stop()
	}

	return {
		container,
		dbLayer,
		run,
		reset,
		stop,
	}
}
