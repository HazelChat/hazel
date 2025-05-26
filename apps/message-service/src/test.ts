import { ChannelId, UserId } from "@maki-chat/api-schema/schema"
import { SqlCassandra } from "@maki-chat/backend-shared"
import { MessageService } from "@maki-chat/backend-shared/services"
import { String } from "effect"
import { Option } from "effect"
import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import { nanoid } from "nanoid"

const SqlLive = SqlCassandra.layer({
	contactPoints: ["127.0.0.1"],
	localDataCenter: "datacenter1",
	keyspace: "chat",
	transformQueryNames: String.camelToSnake,
})

const simpleTest = Effect.gen(function* () {
	const message = yield* MessageService

	yield* Console.log("Testing Cassandra connection...")

	// const channelId = ChannelId.make(`cha_${nanoid(10)}`)
	const channelId = ChannelId.make("cha_IWzcz6x7V-")
	const authorId = UserId.make(`usr_${nanoid(10)}`)

	yield* message
		.create(channelId, {
			content: "Hello, world!",
			threadChannelId: Option.none(),
			authorId: authorId,
			replyToMessageId: Option.none(),
			attachedFiles: [],
		})
		.pipe(
			Effect.repeat({
				times: 1000000,
			}),
		)

	console.log("Messages created successfully.")
})

const main = simpleTest.pipe(
	Effect.provide(MessageService.Default),
	Effect.scoped,
	Effect.provide(SqlLive),
	Effect.catchAll((error) => Console.error(`Error: ${error}`)),
)

await Effect.runPromise(main)
