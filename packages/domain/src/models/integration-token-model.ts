import { IntegrationConnectionId, IntegrationTokenId } from "@hazel/schema"
import { Schema as S } from "effect"
import * as M from "./utils"
import { JsonDate } from "./utils"

class Model extends M.Class<Model>("IntegrationToken")({
	id: M.Generated(IntegrationTokenId),
	connectionId: IntegrationConnectionId,
	encryptedAccessToken: S.String,
	encryptedRefreshToken: S.NullOr(S.String),
	iv: S.String,
	refreshTokenIv: S.NullOr(S.String),
	encryptionKeyVersion: S.Number,
	tokenType: S.NullOr(S.String),
	scope: S.NullOr(S.String),
	expiresAt: S.NullOr(JsonDate),
	refreshTokenExpiresAt: S.NullOr(JsonDate),
	lastRefreshedAt: S.NullOr(JsonDate),
	createdAt: M.Generated(JsonDate),
	updatedAt: M.Generated(JsonDate),
}) {}

export const { Insert, Update, Schema, Create, Patch } = M.expose(Model)
export type Type = typeof Schema.Type
