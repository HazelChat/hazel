#!/usr/bin/env bun

import { and, Database, eq, isNull, ne, schema } from "@hazel/db"
import { Effect, Layer, Logger, LogLevel } from "effect"
import { ChannelAccessSyncService } from "../src/services/channel-access-sync"
import { DatabaseLive } from "../src/services/database"

const rebuildChannelAccess = Effect.gen(function* () {
	const db = yield* Database.Database

	yield* Effect.logInfo("Rebuilding channel_access table")

	yield* db.execute((client) => client.delete(schema.channelAccessTable))

	const activeNonThreadChannels = yield* db.execute((client) =>
		client
			.select({ id: schema.channelsTable.id })
			.from(schema.channelsTable)
			.where(and(isNull(schema.channelsTable.deletedAt), ne(schema.channelsTable.type, "thread"))),
	)

	yield* Effect.forEach(
		activeNonThreadChannels,
		(channel) => ChannelAccessSyncService.syncChannel(channel.id),
		{ concurrency: 20 },
	)

	const threadChannels = yield* db.execute((client) =>
		client
			.select({ id: schema.channelsTable.id })
			.from(schema.channelsTable)
			.where(and(isNull(schema.channelsTable.deletedAt), eq(schema.channelsTable.type, "thread"))),
	)

	yield* Effect.forEach(threadChannels, (channel) => ChannelAccessSyncService.syncChannel(channel.id), {
		concurrency: 20,
	})

	const countResult = yield* db.execute(
		(client) => client.$client`SELECT COUNT(*)::int AS count FROM channel_access`,
	)
	const count = (countResult[0] as { count: number } | undefined)?.count ?? 0

	console.log(
		`channel_access rebuilt: ${activeNonThreadChannels.length} non-thread channels, ${threadChannels.length} threads, ${count} rows`,
	)
})

const ChannelAccessSyncLive = ChannelAccessSyncService.Default.pipe(Layer.provideMerge(DatabaseLive))

Effect.runPromise(
	rebuildChannelAccess.pipe(
		Effect.provide(ChannelAccessSyncLive),
		Effect.provide(DatabaseLive),
		Effect.provide(Logger.minimumLogLevel(LogLevel.Info)),
	),
).catch((error) => {
	console.error("Failed to rebuild channel_access", error)
	process.exit(1)
})
