import { Schema } from "effect"
import { defineMessageUnion } from "foldkit/message"
import { Preview } from "./model"

export const Message = defineMessageUnion({
	SucceededFetchPreview: { preview: Preview },
	FailedFetchPreview: { isNotFound: Schema.Boolean },
	ClickedSignIn: {},
	ClickedAccept: {},
	ClickedSignOut: {},
	/** The browser is loading the workspace or sign-in. */
	LeftPage: {},
	FailedAccept: { error: Schema.String },
})
export type Message = typeof Message.Type
