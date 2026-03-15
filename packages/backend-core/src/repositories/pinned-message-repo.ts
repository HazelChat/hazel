import { ModelRepository, schema } from "@hazel/db"
import { PinnedMessage } from "@hazel/domain/models"
import { ServiceMap, Effect } from "effect"

export class PinnedMessageRepo extends ServiceMap.Service<PinnedMessageRepo>()("PinnedMessageRepo", {
	make: Effect.gen(function* () {
		const baseRepo = yield* ModelRepository.makeRepository(
			schema.pinnedMessagesTable,
			PinnedMessage.Model,
			{
				idColumn: "id",
				name: "PinnedMessage",
			},
		)

		return baseRepo
	}),
}) {
	static readonly layer = Layer.effect(this, this.make)
}
