import {
	InvitationRepo,
	OrganizationMemberRepo,
	OrganizationRepo,
	UserRepo,
	WorkOSClient,
	WorkOSSync,
} from "@hazel/backend-core"
import { Effect, Layer, Logger } from "effect"
import { DatabaseLive } from "../services/database"

const RepoLive = Layer.mergeAll(
	UserRepo.layer,
	OrganizationRepo.layer,
	OrganizationMemberRepo.layer,
	InvitationRepo.layer,
).pipe(Layer.provideMerge(DatabaseLive))

const MainLive = Layer.mergeAll(WorkOSSync.layer, WorkOSClient.layer).pipe(
	Layer.provideMerge(RepoLive),
	Layer.provideMerge(DatabaseLive),
)

const syncWorkos = Effect.gen(function* () {
	const workOsSync = yield* WorkOSSync

	yield* workOsSync.syncAll
}).pipe(Effect.provide(MainLive), Effect.provide(Logger.pretty))

Effect.runPromise(syncWorkos)
