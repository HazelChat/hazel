import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql"
import { RedisContainer, type StartedRedisContainer } from "@testcontainers/redis"
import { GenericContainer, type StartedTestContainer, Wait } from "testcontainers"
import { spawn, type ChildProcess } from "child_process"
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "fs"
import { dirname, join } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = join(__dirname, "../../..")
const STATE_FILE = join(__dirname, ".test-state.json")

// Use same port as dev server (3003) to match WorkOS redirect URI
// Stop dev server before running e2e tests
const TEST_BACKEND_PORT = 3003
const TEST_ELECTRIC_PROXY_PORT = 8185

export interface TestInfrastructure {
	pgContainer: StartedPostgreSqlContainer
	redisContainer: StartedRedisContainer
	electricContainer: StartedTestContainer
	electricProxyProcess: ChildProcess
	backendProcess: ChildProcess
	databaseUrl: string
	redisUrl: string
	electricUrl: string
}

export interface TestState {
	pgContainerId: string
	redisContainerId: string
	electricContainerId: string
	electricProxyPid: number
	backendPid: number
	databaseUrl: string
	redisUrl: string
	electricUrl: string
}

async function waitForUrl(url: string, timeoutMs = 60000, intervalMs = 500): Promise<void> {
	const start = Date.now()
	while (Date.now() - start < timeoutMs) {
		try {
			const response = await fetch(url)
			if (response.ok) {
				return
			}
		} catch {
			// Server not ready yet
		}
		await new Promise((resolve) => setTimeout(resolve, intervalMs))
	}
	throw new Error(`Timeout waiting for ${url} after ${timeoutMs}ms`)
}

// Test organization ID from WorkOS - this is the externalId set in WorkOS
// for the test user's organization
const TEST_ORG_ID = "203fac34-ec01-40f9-b620-a1e56fdd9f25"

async function runDatabaseMigrations(databaseUrl: string): Promise<void> {
	const postgres = (await import("postgres")).default
	const { drizzle } = await import("drizzle-orm/postgres-js")
	const { migrate } = await import("drizzle-orm/postgres-js/migrator")

	const sql = postgres(databaseUrl, { max: 1 })
	const db = drizzle(sql)

	const migrationsFolder = join(PROJECT_ROOT, "packages/db/drizzle")

	try {
		console.log(`  [migrate] Running migrations from ${migrationsFolder}`)
		await migrate(db, { migrationsFolder })
		console.log("  [migrate] Migrations completed")
	} finally {
		await sql.end()
	}
}

async function seedTestOrganization(databaseUrl: string): Promise<void> {
	const postgres = (await import("postgres")).default
	const sql = postgres(databaseUrl, { max: 1 })

	try {
		console.log(`  [seed] Creating test organization with ID ${TEST_ORG_ID}`)
		// Create the test organization that WorkOS expects
		await sql`
			INSERT INTO organizations (id, name, slug, "createdAt", "updatedAt")
			VALUES (${TEST_ORG_ID}::uuid, 'Test Org', 'test-org', NOW(), NOW())
			ON CONFLICT (id) DO NOTHING
		`
		console.log("  [seed] Test organization created")
	} finally {
		await sql.end()
	}
}

export async function startTestInfrastructure(): Promise<TestInfrastructure> {
	console.log("  Starting PostgreSQL container...")
	const pgContainer = await new PostgreSqlContainer("postgres:17-alpine")
		.withCommand([
			"postgres",
			"-c",
			"wal_level=logical",
			"-c",
			"max_wal_senders=10",
			"-c",
			"max_replication_slots=5",
		])
		.start()
	const databaseUrl = pgContainer.getConnectionUri()
	console.log(`  PostgreSQL ready at port ${pgContainer.getPort()}`)

	console.log("  Starting Redis container...")
	const redisContainer = await new RedisContainer("redis:7-alpine").start()
	const redisUrl = redisContainer.getConnectionUrl()
	console.log(`  Redis ready at port ${redisContainer.getPort()}`)

	console.log("  Running database migrations...")
	try {
		await runDatabaseMigrations(databaseUrl)
		console.log("  Migrations completed successfully")
	} catch (error) {
		console.error("  Failed to run migrations:", error)
		await pgContainer.stop()
		await redisContainer.stop()
		throw error
	}

	console.log("  Seeding test data...")
	try {
		await seedTestOrganization(databaseUrl)
		console.log("  Test data seeded successfully")
	} catch (error) {
		console.error("  Failed to seed test data:", error)
		await pgContainer.stop()
		await redisContainer.stop()
		throw error
	}

	// Build Electric database URL using container's internal network
	// Electric needs to connect to PostgreSQL from within Docker
	const pgHost = pgContainer.getHost()
	const pgPort = pgContainer.getPort()
	const electricDatabaseUrl = `postgresql://test:test@${pgHost}:${pgPort}/test?sslmode=disable`

	console.log("  Starting Electric SQL container...")
	const electricContainer = await new GenericContainer("electricsql/electric:canary")
		.withExposedPorts(3000)
		.withEnvironment({
			DATABASE_URL: electricDatabaseUrl,
			ELECTRIC_INSECURE: "true",
			ELECTRIC_FEATURE_FLAGS: "allow_subqueries,tagged_subqueries",
		})
		.withWaitStrategy(Wait.forHttp("/v1/health", 3000))
		.start()

	const electricInternalUrl = `http://${electricContainer.getHost()}:${electricContainer.getMappedPort(3000)}`
	console.log(`  Electric SQL ready at ${electricInternalUrl}`)

	console.log("  Starting Electric Proxy...")
	const electricProxyProcess = spawn("bun", ["run", "src/index.ts"], {
		cwd: join(PROJECT_ROOT, "apps/electric-proxy"),
		env: {
			...process.env,
			DATABASE_URL: databaseUrl,
			REDIS_URL: redisUrl,
			ELECTRIC_URL: electricInternalUrl,
			PORT: String(TEST_ELECTRIC_PROXY_PORT),
		},
		stdio: ["pipe", "pipe", "pipe"],
		detached: false,
	})

	electricProxyProcess.stdout?.on("data", (data) => {
		const msg = data.toString().trim()
		if (msg) console.log(`  [electric-proxy] ${msg}`)
	})

	electricProxyProcess.stderr?.on("data", (data) => {
		const msg = data.toString().trim()
		if (msg) console.error(`  [electric-proxy:err] ${msg}`)
	})

	const electricUrl = `http://localhost:${TEST_ELECTRIC_PROXY_PORT}/v1/shape`

	console.log("  Waiting for Electric Proxy health check...")
	try {
		await waitForUrl(`http://localhost:${TEST_ELECTRIC_PROXY_PORT}/health`, 30000)
		console.log("  Electric Proxy is healthy")
	} catch (error) {
		console.error("  Electric Proxy failed to start:", error)
		electricProxyProcess.kill()
		await electricContainer.stop()
		await pgContainer.stop()
		await redisContainer.stop()
		throw error
	}

	console.log("  Starting backend server...")
	const backendProcess = spawn("bun", ["run", "src/index.ts"], {
		cwd: join(PROJECT_ROOT, "apps/backend"),
		env: {
			...process.env,
			DATABASE_URL: databaseUrl,
			REDIS_URL: redisUrl,
			PORT: String(TEST_BACKEND_PORT),
			IS_DEV: "true",
			// Override WorkOS redirect URI to point to test backend
			WORKOS_REDIRECT_URI: `http://localhost:${TEST_BACKEND_PORT}/auth/callback`,
		},
		stdio: ["pipe", "pipe", "pipe"],
		detached: false,
	})

	// Log backend output for debugging
	backendProcess.stdout?.on("data", (data) => {
		const msg = data.toString().trim()
		if (msg) console.log(`  [backend] ${msg}`)
	})

	backendProcess.stderr?.on("data", (data) => {
		const msg = data.toString().trim()
		if (msg) console.error(`  [backend:err] ${msg}`)
	})

	backendProcess.on("error", (err) => {
		console.error("  Backend process error:", err)
	})

	console.log("  Waiting for backend health check...")
	try {
		await waitForUrl(`http://localhost:${TEST_BACKEND_PORT}/health`, 60000)
		console.log("  Backend is healthy")
	} catch (error) {
		console.error("  Backend failed to start:", error)
		backendProcess.kill()
		electricProxyProcess.kill()
		await electricContainer.stop()
		await pgContainer.stop()
		await redisContainer.stop()
		throw error
	}

	// Save state for teardown
	const state: TestState = {
		pgContainerId: pgContainer.getId(),
		redisContainerId: redisContainer.getId(),
		electricContainerId: electricContainer.getId(),
		electricProxyPid: electricProxyProcess.pid!,
		backendPid: backendProcess.pid!,
		databaseUrl,
		redisUrl,
		electricUrl,
	}
	writeFileSync(STATE_FILE, JSON.stringify(state, null, 2))

	return {
		pgContainer,
		redisContainer,
		electricContainer,
		electricProxyProcess,
		backendProcess,
		databaseUrl,
		redisUrl,
		electricUrl,
	}
}

export async function stopTestInfrastructure(): Promise<void> {
	if (!existsSync(STATE_FILE)) {
		console.log("  No test state file found, nothing to clean up")
		return
	}

	const state: TestState = JSON.parse(readFileSync(STATE_FILE, "utf-8"))

	// Kill backend process
	if (state.backendPid) {
		console.log(`  Stopping backend process (PID: ${state.backendPid})...`)
		try {
			process.kill(state.backendPid, "SIGTERM")
		} catch {
			// Process might already be dead
		}
	}

	// Kill electric proxy process
	if (state.electricProxyPid) {
		console.log(`  Stopping electric proxy process (PID: ${state.electricProxyPid})...`)
		try {
			process.kill(state.electricProxyPid, "SIGTERM")
		} catch {
			// Process might already be dead
		}
	}

	// Give processes a moment to shut down gracefully
	await new Promise((resolve) => setTimeout(resolve, 1000))

	// Containers are automatically cleaned up by testcontainers' Ryuk
	console.log("  Containers will be cleaned up by Ryuk...")

	// Remove state file
	try {
		unlinkSync(STATE_FILE)
	} catch {
		// File might not exist
	}
}

export function getTestState(): TestState | null {
	if (!existsSync(STATE_FILE)) {
		return null
	}
	return JSON.parse(readFileSync(STATE_FILE, "utf-8"))
}

export { TEST_BACKEND_PORT }
