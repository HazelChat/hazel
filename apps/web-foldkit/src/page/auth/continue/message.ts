import { Schema } from "effect"
import { defineMessageUnion } from "foldkit/message"

export const Message = defineMessageUnion({
	LeftForProvider: {},
	FailedSignIn: { message: Schema.NullOr(Schema.String) },
})
export type Message = typeof Message.Type
