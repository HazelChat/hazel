import { ChannelId, ChannelMemberId, TypingIndicatorId } from "@hazel/schema"
import { Schema } from "effect"
import * as M from "./utils"

export class Model extends M.Class<Model>("TypingIndicator")({
	id: M.Generated(TypingIndicatorId),
	channelId: ChannelId,
	memberId: ChannelMemberId,
	lastTyped: Schema.Number.annotations({
		title: "LastTyped",
		description: "Unix timestamp of last typing activity",
	}),
}) {}

export const Insert = Model.insert
export const Update = Model.update
