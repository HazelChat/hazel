import { ChannelId, OrganizationId, RssSubscriptionId, UserId } from "@hazel/schema"
import { Schema } from "effect"
import * as M from "./utils"
import { JsonDate } from "./utils"

export class Model extends M.Class<Model>("RssSubscription")({
	id: M.Generated(RssSubscriptionId),
	channelId: ChannelId,
	organizationId: OrganizationId,
	feedUrl: Schema.String,
	feedTitle: Schema.NullOr(Schema.String),
	feedIconUrl: Schema.NullOr(Schema.String),
	lastFetchedAt: M.Generated(Schema.NullOr(JsonDate)),
	lastItemPublishedAt: M.Generated(Schema.NullOr(JsonDate)),
	lastItemGuid: M.Generated(Schema.NullOr(Schema.String)),
	consecutiveErrors: M.Generated(Schema.Number),
	lastErrorMessage: M.Generated(Schema.NullOr(Schema.String)),
	lastErrorAt: M.Generated(Schema.NullOr(JsonDate)),
	isEnabled: Schema.Boolean,
	pollingIntervalMinutes: Schema.Number,
	createdBy: UserId,
	createdAt: M.Generated(JsonDate),
	updatedAt: M.Generated(Schema.NullOr(JsonDate)),
	deletedAt: M.GeneratedByApp(Schema.NullOr(JsonDate)),
}) {}

export const Insert = Model.insert
export const Update = Model.update
