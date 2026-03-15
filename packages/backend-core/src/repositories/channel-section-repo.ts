import { ModelRepository, schema } from "@hazel/db"
import { ChannelSection } from "@hazel/domain/models"
import { ServiceMap, Effect } from "effect"

export class ChannelSectionRepo extends ServiceMap.Service<ChannelSectionRepo>()("ChannelSectionRepo", {
	make: Effect.gen(function* () {
		const baseRepo = yield* ModelRepository.makeRepository(
			schema.channelSectionsTable,
			ChannelSection.Model,
			{
				idColumn: "id",
				name: "ChannelSection",
			},
		)

		return baseRepo
	}),
}) {}
