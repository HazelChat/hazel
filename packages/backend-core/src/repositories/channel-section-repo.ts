import { ModelRepository, schema } from "@hazel/db"
import { ChannelSection } from "@hazel/domain/models"
import { Effect } from "effect"

export class ChannelSectionRepo extends Effect.Service<ChannelSectionRepo>()("ChannelSectionRepo", {
	accessors: true,
	effect: Effect.gen(function* () {
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
