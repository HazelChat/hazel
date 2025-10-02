import { Schema } from "effect"
import * as Model from "../services/model"

export const JsonDate = Schema.Union(Schema.DateFromString, Schema.DateFromSelf).pipe(
	Schema.annotations({
		jsonSchema: { type: "string", format: "date-time" },
	}),
)

export const baseFields = {
	createdAt: Model.Generated(JsonDate),
	updatedAt: Model.Generated(Schema.NullOr(JsonDate)),
	deletedAt: Model.GeneratedByApp(Schema.NullOr(JsonDate)),
}
