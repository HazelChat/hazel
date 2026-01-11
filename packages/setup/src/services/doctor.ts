import { Effect } from "effect"

export interface CheckResult {
	name: string
	status: "ok" | "warn" | "fail"
	message: string
}

// Helper to check if a docker container is running
const checkContainer = (containerName: string, displayName: string): Effect.Effect<CheckResult> =>
	Effect.tryPromise({
		try: async () => {
			const proc = Bun.spawn(["docker", "inspect", "--format", "{{.State.Status}}", containerName], {
				stdout: "pipe",
				stderr: "ignore",
			})
			const output = await new Response(proc.stdout).text()
			const code = await proc.exited

			if (code !== 0) {
				return { name: displayName, status: "fail" as const, message: "Not running" }
			}

			const status = output.trim()
			if (status !== "running") {
				return { name: displayName, status: "fail" as const, message: `Status: ${status}` }
			}
			return { name: displayName, status: "ok" as const, message: "Running" }
		},
		catch: () => new Error("Check failed"),
	}).pipe(
		Effect.catchAll(() =>
			Effect.succeed({ name: displayName, status: "fail" as const, message: "Not running" }),
		),
	)

export class Doctor extends Effect.Service<Doctor>()("Doctor", {
	accessors: true,
	effect: Effect.succeed({
		checkBun: (): Effect.Effect<CheckResult> =>
			Effect.tryPromise({
				try: async () => {
					const proc = Bun.spawn(["bun", "--version"])
					const text = await new Response(proc.stdout).text()
					await proc.exited
					return { name: "Bun", status: "ok" as const, message: `v${text.trim()}` }
				},
				catch: () => new Error("Bun not found"),
			}).pipe(
				Effect.catchAll(() =>
					Effect.succeed({
						name: "Bun",
						status: "fail" as const,
						message: "Not found. Install from https://bun.sh",
					}),
				),
			),

		checkDocker: (): Effect.Effect<CheckResult> =>
			Effect.tryPromise({
				try: async () => {
					const proc = Bun.spawn(["docker", "info"], { stdout: "ignore", stderr: "ignore" })
					const code = await proc.exited
					if (code !== 0) throw new Error("Docker not running")
					return { name: "Docker", status: "ok" as const, message: "Running" }
				},
				catch: () => new Error("Docker not running"),
			}).pipe(
				Effect.catchAll(() =>
					Effect.succeed({
						name: "Docker",
						status: "fail" as const,
						message: "Not running. Start Docker Desktop",
					}),
				),
			),

		checkDockerCompose: (): Effect.Effect<CheckResult> =>
			Effect.tryPromise({
				try: async () => {
					const proc = Bun.spawn(["docker", "compose", "ps", "--format", "json"])
					const text = await new Response(proc.stdout).text()
					await proc.exited
					const containers = text.trim().split("\n").filter(Boolean)
					if (containers.length === 0) {
						return {
							name: "Docker Compose",
							status: "warn" as const,
							message: "No containers running. Run `docker compose up -d`",
						}
					}
					return {
						name: "Docker Compose",
						status: "ok" as const,
						message: `${containers.length} container(s) running`,
					}
				},
				catch: () => new Error("Could not check containers"),
			}).pipe(
				Effect.catchAll(() =>
					Effect.succeed({
						name: "Docker Compose",
						status: "warn" as const,
						message: "Could not check containers",
					}),
				),
			),

		checkPostgres: (): Effect.Effect<CheckResult> => checkContainer("app-postgres-1", "PostgreSQL"),
		checkRedis: (): Effect.Effect<CheckResult> => checkContainer("app-cache_redis-1", "Redis"),
		checkElectric: (): Effect.Effect<CheckResult> => checkContainer("app-electric-1", "Electric"),
		checkSequin: (): Effect.Effect<CheckResult> => checkContainer("app-sequin-1", "Sequin"),
		checkCaddy: (): Effect.Effect<CheckResult> => checkContainer("app-caddy-1", "Caddy"),

		runAllChecks: (): Effect.Effect<
			{ environment: CheckResult[]; services: CheckResult[] },
			never,
			Doctor
		> =>
			Effect.gen(function* () {
				const doctor = yield* Doctor
				const [environment, services] = yield* Effect.all([
					Effect.all([doctor.checkBun(), doctor.checkDocker(), doctor.checkDockerCompose()]),
					Effect.all([
						doctor.checkPostgres(),
						doctor.checkRedis(),
						doctor.checkElectric(),
						doctor.checkSequin(),
						doctor.checkCaddy(),
					]),
				])
				return { environment, services }
			}),
	}),
}) {}
