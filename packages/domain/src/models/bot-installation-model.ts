import { BotId, BotInstallationId, OrganizationId, UserId } from "@hazel/schema"
import { Schema } from "effect"
import * as M from "./utils"
import { Generated, JsonDate } from "./utils"

export class Model extends M.Class<Model>("BotInstallation")({
	id: M.Generated(BotInstallationId),
	botId: BotId,
	organizationId: OrganizationId,
	installedBy: UserId,
	installedAt: Generated(JsonDate),
}) {}

export const Insert = Model.insert
export const Update = Model.update
