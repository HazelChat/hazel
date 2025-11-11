import { Schema } from "effect"
import { ChannelId, ChannelMemberId, TypingIndicatorId } from "../schema/ids"
import * as M from "../services/model"

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
