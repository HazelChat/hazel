import { execFileSync } from "node:child_process"
import { Database } from "@hazel/db"
import { migrateUrl } from "@hazel/db/migrate"
import { Effect, Layer, Redacted, Schema } from "effect"

const POSTGRES_IMAGE = "postgres:17-alpine"
const POSTGRES_USER = "user"
const POSTGRES_PASSWORD = "password"
const POSTGRES_DB = "app"
const STARTUP_TIMEOUT_MS = 60_000
const POLL_INTERVAL_MS = 500
const REQUIRED_TABLES = [
	"chat_sync_event_receipts",
	"chat_sync_message_links",
	"chat_sync_channel_links",
	"chat_sync_connections",
	"message_outbox_events",
] as const

const TRUNCATE_SQL = `
TRUNCATE TABLE
	chat_sync_event_receipts,
	chat_sync_message_links,
	chat_sync_channel_links,
	chat_sync_connections,
	message_outbox_events,
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
	readonly container: {
		getConnectionUri: () => string
	}
	readonly dbLayer: Layer.Layer<Database.Database>
	run: <A, E, R>(effect: Effect.Effect<A, E, R>) => Promise<A>
	reset: () => Promise<void>
	stop: () => Promise<void>
}

const runDocker = (args: ReadonlyArray<string>, options?: { stdio?: "pipe" | "ignore" }) =>
	execFileSync("docker", [...args], {
		encoding: "utf8",
		stdio: options?.stdio ?? "pipe",
	})

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const waitForPostgres = async (containerId: string) => {
	const deadline = Date.now() + STARTUP_TIMEOUT_MS

	while (Date.now() < deadline) {
		try {
			// Over TCP: the image's init-time server listens only on the Unix socket and is then
			// restarted, so a socket check can pass before the real server accepts connections.
			runDocker(
				[
					"exec",
					containerId,
					"pg_isready",
					"-h",
					"127.0.0.1",
					"-U",
					POSTGRES_USER,
					"-d",
					POSTGRES_DB,
				],
				{
					stdio: "ignore",
				},
			)
			return
		} catch {
			await sleep(POLL_INTERVAL_MS)
		}
	}

	throw new Error(`Timed out waiting for postgres container ${containerId} to become ready`)
}

const getPublishedPort = (containerId: string) => {
	const portBinding = runDocker(["port", containerId, "5432/tcp"]).trim()
	const hostPort = portBinding.split(":").at(-1)

	if (!hostPort) {
		throw new Error(`Could not determine published port for postgres container ${containerId}`)
	}

	return hostPort
}

const TableRow = Schema.Struct({ tablename: Schema.String })

const listTables = (dbLayer: Layer.Layer<Database.Database>) =>
	Effect.runPromise(
		Effect.gen(function* () {
			const db = yield* Database.Database
			return yield* db.query(
				Database.sql`select tablename from pg_tables where schemaname = 'public' order by tablename`,
				TableRow,
			)
		}).pipe(Effect.provide(dbLayer), Effect.scoped),
	)

const ensureSchema = async (databaseUrl: string, dbLayer: Layer.Layer<Database.Database>) => {
	await Effect.runPromise(migrateUrl(databaseUrl))

	const tableSet = new Set((await listTables(dbLayer)).map((row) => row.tablename))
	const stillMissing = REQUIRED_TABLES.filter((table) => !tableSet.has(table))
	if (stillMissing.length > 0) {
		throw new Error(`Chat sync test schema is incomplete: missing ${stillMissing.join(", ")}`)
	}
}

export const createChatSyncDbHarness = async (databaseUrl?: string): Promise<ChatSyncDbHarness> => {
	if (databaseUrl !== undefined) return connectHarness(databaseUrl, async () => {})
	const containerId = runDocker([
		"run",
		"-d",
		"--rm",
		"-e",
		`POSTGRES_USER=${POSTGRES_USER}`,
		"-e",
		`POSTGRES_PASSWORD=${POSTGRES_PASSWORD}`,
		"-e",
		`POSTGRES_DB=${POSTGRES_DB}`,
		"-p",
		"127.0.0.1::5432",
		POSTGRES_IMAGE,
	]).trim()

	try {
		await waitForPostgres(containerId)
		const hostPort = getPublishedPort(containerId)
		const databaseUrl = `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@127.0.0.1:${hostPort}/${POSTGRES_DB}?sslmode=disable`

		return await connectHarness(databaseUrl, async () => {
			runDocker(["rm", "-f", containerId], { stdio: "ignore" })
		})
	} catch (error) {
		runDocker(["rm", "-f", containerId], { stdio: "ignore" })
		throw error
	}
}

/** An explicitly supplied disposable database, useful when Docker cannot start containers. */
const connectHarness = async (databaseUrl: string, stop: () => Promise<void>): Promise<ChatSyncDbHarness> => {
	const dbLayer = Database.layer({
		url: Redacted.make(databaseUrl),
		ssl: false,
	}).pipe(Layer.orDie)

	await ensureSchema(databaseUrl, dbLayer)

	const run = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
		Effect.runPromise((effect as Effect.Effect<A, E, never>).pipe(Effect.provide(dbLayer), Effect.scoped))

	const reset = () =>
		run(
			Effect.gen(function* () {
				const db = yield* Database.Database
				yield* db.execute(Database.sql.raw(TRUNCATE_SQL))
			}),
		)

	return {
		container: {
			getConnectionUri: () => databaseUrl,
		},
		dbLayer,
		run,
		reset,
		stop,
	}
}
