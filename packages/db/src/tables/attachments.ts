import { AttachmentId, ChannelId, MessageId, OrganizationId, UserId } from "@hazel/schema"
import * as PG from "@maple-dev/effect-orm/postgres"
import { pgEnum, timestamptz, varchar } from "./columns"

export const attachmentStatusEnum = pgEnum("attachment_status", ["uploading", "complete", "failed"])

export const attachmentsTable = PG.table("attachments", {
	columns: {
		id: PG.column(PG.brand(PG.uuid, AttachmentId), { defaultExpr: "gen_random_uuid()" }),
		organizationId: PG.brand(PG.uuid, OrganizationId),
		channelId: PG.nullable(PG.brand(PG.uuid, ChannelId)),
		messageId: PG.nullable(PG.brand(PG.uuid, MessageId)),
		fileName: varchar(255),
		fileSize: PG.int4,
		externalUrl: PG.nullable(varchar(2048)),
		uploadedBy: PG.brand(PG.uuid, UserId),
		status: PG.column(attachmentStatusEnum, { default: "uploading" }),
		uploadedAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		deletedAt: PG.nullable(timestamptz),
	},
	primaryKey: ["id"],
	indexes: [
		PG.index("attachments_organization_id_idx", ["organizationId"]),
		PG.index("attachments_channel_id_idx", ["channelId"]),
		PG.index("attachments_message_id_idx", ["messageId"]),
		PG.index("attachments_message_uploaded_at_idx", ["messageId", "uploadedAt"]),
		PG.index("attachments_uploaded_by_idx", ["uploadedBy"]),
		PG.index("attachments_status_idx", ["status"]),
		PG.index("attachments_deleted_at_idx", ["deletedAt"]),
	],
})
export type Attachment = PG.SelectRowOf<typeof attachmentsTable>
export type NewAttachment = PG.InsertRowOf<typeof attachmentsTable>
