CREATE TABLE "channel_notifications" (
	"channel_id" text NOT NULL,
	"user_id" text NOT NULL,
	"last_seen_message_id" text,
	"notification_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "channel_notifications_channel_id_user_id_pk" PRIMARY KEY("channel_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "channel_notifications" ADD CONSTRAINT "channel_notifications_channel_id_server_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."server_channels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_notifications" ADD CONSTRAINT "channel_notifications_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_notifications" ADD CONSTRAINT "channel_notifications_last_seen_message_id_messages_id_fk" FOREIGN KEY ("last_seen_message_id") REFERENCES "public"."messages"("id") ON DELETE set null ON UPDATE no action;