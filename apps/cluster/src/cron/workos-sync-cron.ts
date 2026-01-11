import * as ClusterCron from "@effect/cluster/ClusterCron"
import { WorkOSSync } from "@hazel/backend-core/services"
import * as Cron from "effect/Cron"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"

const workOsCron = Cron.unsafeParse("0 */12 * * *")

export const WorkOSSyncCronLayer = ClusterCron.make({
	name: "WorkOSSync",
	cron: workOsCron,
	execute: Effect.gen(function* () {
		yield* Effect.logDebug("Starting scheduled WorkOS sync...")
		const result = yield* WorkOSSync.syncAll
		yield* Effect.logDebug("WorkOS sync completed", {
			users: result.users,
			organizations: result.organizations,
			memberships: result.memberships,
			invitations: result.invitations,
			totalErrors: result.totalErrors,
			durationMs: result.endTime - result.startTime,
		})
	}),
	skipIfOlderThan: Duration.minutes(5),
})
