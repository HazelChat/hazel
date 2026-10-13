import { AttachmentId, ChannelId, MessageId, OrganizationId, UserId } from "@hazel/schema"
import * as PG from "@maple-dev/effect-orm/postgres"
import { now, timestamptz, uuid, varchar } from "./columns"

export const attachmentStatusEnum = PG.enumType("attachment_status", ["uploading", "complete", "failed"])

export const attachmentsTable = PG.table("attachments", {
	columns: {
		id: PG.column(uuid(AttachmentId), { defaultExpr: "gen_random_uuid()" }),
		organizationId: uuid(OrganizationId),
		channelId: PG.nullable(uuid(ChannelId)),
		messageId: PG.nullable(uuid(MessageId)),
		fileName: varchar(255),
		fileSize: PG.int4,
		externalUrl: PG.nullable(varchar(2048)),
		uploadedBy: uuid(UserId),
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
