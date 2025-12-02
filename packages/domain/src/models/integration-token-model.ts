import { IntegrationConnectionId, IntegrationTokenId } from "@hazel/schema"
import { Schema } from "effect"
import * as M from "./utils"
import { JsonDate } from "./utils"

export class Model extends M.Class<Model>("IntegrationToken")({
	id: M.Generated(IntegrationTokenId),
	connectionId: IntegrationConnectionId,
	encryptedAccessToken: Schema.String,
	encryptedRefreshToken: Schema.NullOr(Schema.String),
	iv: Schema.String,
	refreshTokenIv: Schema.NullOr(Schema.String),
	encryptionKeyVersion: Schema.Number,
	tokenType: Schema.NullOr(Schema.String),
	scope: Schema.NullOr(Schema.String),
	expiresAt: Schema.NullOr(JsonDate),
	refreshTokenExpiresAt: Schema.NullOr(JsonDate),
	lastRefreshedAt: Schema.NullOr(JsonDate),
	createdAt: M.Generated(JsonDate),
	updatedAt: M.Generated(JsonDate),
}) {}

export const Insert = Model.insert
export const Update = Model.update
