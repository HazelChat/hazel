import { ModelRepository, schema } from "@hazel/db"
import { Attachment } from "@hazel/domain/models"
import { ServiceMap, Effect } from "effect"

export class AttachmentRepo extends ServiceMap.Service<AttachmentRepo>()("AttachmentRepo", {
	make: Effect.gen(function* () {
		const baseRepo = yield* ModelRepository.makeRepository(schema.attachmentsTable, Attachment.Model, {
			idColumn: "id",
			name: "Attachment",
		})

		return baseRepo
	}),
}) {
	static readonly layer = Layer.effect(this, this.make)
}
