import { Schema } from "effect"
import { defineMessageUnion } from "foldkit/message"

export const Message = defineMessageUnion({
	ChangedFirstName: { value: Schema.String },
	ChangedLastName: { value: Schema.String },
	SubmittedRegistration: {},
	/** The account exists and the browser is loading the app. */
	LeftForApp: {},
	FailedRegistration: { message: Schema.NullOr(Schema.String) },
})
export type Message = typeof Message.Type
