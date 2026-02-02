import { ModelRepository, schema } from "@hazel/db"
import { Attachment } from "@hazel/domain/models"
import { Effect } from "effect"

export class AttachmentRepo extends Effect.Service<AttachmentRepo>()("AttachmentRepo", {
	accessors: true,
	effect: Effect.gen(function* () {
		const baseRepo = yield* ModelRepository.makeRepository(schema.attachmentsTable, Attachment.Model, {
			idColumn: "id",
			name: "Attachment",
		})

		return baseRepo
	}),
}) {}
