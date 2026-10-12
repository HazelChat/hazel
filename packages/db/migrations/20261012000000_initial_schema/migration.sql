CREATE TYPE public.attachment_status AS ENUM ('uploading', 'complete', 'failed');
--> statement-breakpoint
CREATE TYPE public.channel_type AS ENUM ('public', 'private', 'thread', 'direct', 'single');
--> statement-breakpoint
CREATE TYPE public.chat_sync_connection_status AS ENUM ('active', 'paused', 'error', 'disabled');
--> statement-breakpoint
CREATE TYPE public.chat_sync_direction AS ENUM ('both', 'hazel_to_external', 'external_to_hazel');
--> statement-breakpoint
CREATE TYPE public.chat_sync_receipt_source AS ENUM ('hazel', 'external');
--> statement-breakpoint
CREATE TYPE public.chat_sync_receipt_status AS ENUM ('processed', 'ignored', 'failed');
--> statement-breakpoint
CREATE TYPE public.connect_conversation_channel_role AS ENUM ('host', 'guest');
--> statement-breakpoint
CREATE TYPE public.connect_conversation_status AS ENUM ('active', 'disconnected');
--> statement-breakpoint
CREATE TYPE public.connect_invite_status AS ENUM ('pending', 'accepted', 'declined', 'revoked', 'expired');
--> statement-breakpoint
CREATE TYPE public.connect_invite_target_kind AS ENUM ('slug', 'email');
--> statement-breakpoint
CREATE TYPE public.connection_level AS ENUM ('organization', 'user');
--> statement-breakpoint
CREATE TYPE public.connection_status AS ENUM ('active', 'expired', 'revoked', 'error', 'suspended');
--> statement-breakpoint
CREATE TYPE public.integration_request_status AS ENUM ('pending', 'reviewed', 'planned', 'rejected');
--> statement-breakpoint
CREATE TYPE public.message_outbox_event_status AS ENUM ('pending', 'processing', 'processed', 'failed');
--> statement-breakpoint
CREATE TYPE public.message_outbox_event_type AS ENUM ('message_created', 'message_updated', 'message_deleted', 'reaction_created', 'reaction_deleted');
--> statement-breakpoint
CREATE TYPE public.organization_role AS ENUM ('admin', 'member', 'owner');
--> statement-breakpoint
CREATE TYPE public.user_presence_status_enum AS ENUM ('online', 'away', 'busy', 'dnd', 'offline');
--> statement-breakpoint
CREATE TYPE public.user_type AS ENUM ('user', 'machine');
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "attachments" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"organizationId" uuid NOT NULL,
	"channelId" uuid,
	"messageId" uuid,
	"fileName" character varying(255) NOT NULL,
	"fileSize" integer NOT NULL,
	"externalUrl" character varying(2048),
	"uploadedBy" uuid NOT NULL,
	"status" public.attachment_status NOT NULL DEFAULT 'uploading',
	"uploadedAt" timestamp with time zone NOT NULL DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bot_commands" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"botId" uuid NOT NULL,
	"name" character varying(50) NOT NULL,
	"description" text NOT NULL,
	"arguments" jsonb DEFAULT '[]',
	"usageExample" text,
	"isEnabled" boolean NOT NULL DEFAULT true,
	"createdAt" timestamp with time zone NOT NULL DEFAULT now(),
	"updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
	CONSTRAINT "bot_commands_pkey" PRIMARY KEY ("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bot_installations" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"botId" uuid NOT NULL,
	"organizationId" uuid NOT NULL,
	"installedBy" uuid NOT NULL,
	"installedAt" timestamp with time zone NOT NULL DEFAULT now(),
	CONSTRAINT "bot_installations_pkey" PRIMARY KEY ("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bots" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"userId" uuid NOT NULL,
	"createdBy" uuid NOT NULL,
	"name" character varying(100) NOT NULL,
	"description" text,
	"webhookUrl" text,
	"apiTokenHash" text NOT NULL,
	"scopes" jsonb,
	"metadata" jsonb,
	"isPublic" boolean NOT NULL DEFAULT false,
	"installCount" integer NOT NULL DEFAULT 0,
	"mentionable" boolean NOT NULL DEFAULT false,
	"allowedIntegrations" jsonb DEFAULT '[]',
	"createdAt" timestamp with time zone NOT NULL DEFAULT now(),
	"updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "bots_pkey" PRIMARY KEY ("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "channel_access" (
	"userId" uuid NOT NULL,
	"channelId" uuid NOT NULL,
	"organizationId" uuid NOT NULL,
	"createdAt" timestamp with time zone NOT NULL DEFAULT now(),
	"updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
	CONSTRAINT "channel_access_user_channel_pk" PRIMARY KEY ("userId", "channelId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "channel_members" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"channelId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"isHidden" boolean NOT NULL DEFAULT false,
	"isMuted" boolean NOT NULL DEFAULT false,
	"isFavorite" boolean NOT NULL DEFAULT false,
	"lastSeenMessageId" uuid,
	"notificationCount" integer NOT NULL DEFAULT 0,
	"joinedAt" timestamp with time zone NOT NULL DEFAULT now(),
	"createdAt" timestamp with time zone NOT NULL DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "channel_members_pkey" PRIMARY KEY ("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "channel_sections" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"organizationId" uuid NOT NULL,
	"name" character varying(255) NOT NULL,
	"order" integer NOT NULL DEFAULT 0,
	"createdAt" timestamp with time zone NOT NULL DEFAULT now(),
	"updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "channel_sections_pkey" PRIMARY KEY ("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "channel_webhooks" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"channelId" uuid NOT NULL,
	"organizationId" uuid NOT NULL,
	"botUserId" uuid NOT NULL,
	"name" character varying(100) NOT NULL,
	"description" text,
	"avatarUrl" text,
	"tokenHash" text NOT NULL,
	"tokenSuffix" character varying(4) NOT NULL,
	"isEnabled" boolean NOT NULL DEFAULT true,
	"createdBy" uuid NOT NULL,
	"lastUsedAt" timestamp with time zone,
	"createdAt" timestamp with time zone NOT NULL DEFAULT now(),
	"updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "channel_webhooks_pkey" PRIMARY KEY ("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "channels" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"name" character varying(255) NOT NULL,
	"icon" character varying(32),
	"type" public.channel_type NOT NULL,
	"organizationId" uuid NOT NULL,
	"parentChannelId" uuid,
	"sectionId" uuid,
	"createdAt" timestamp with time zone NOT NULL DEFAULT now(),
	"updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "channels_pkey" PRIMARY KEY ("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat_sync_channel_links" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"syncConnectionId" uuid NOT NULL,
	"hazelChannelId" uuid NOT NULL,
	"externalChannelId" character varying(255) NOT NULL,
	"externalChannelName" character varying(255),
	"direction" public.chat_sync_direction NOT NULL DEFAULT 'both',
	"isActive" boolean NOT NULL DEFAULT true,
	"settings" jsonb,
	"lastSyncedAt" timestamp with time zone,
	"createdAt" timestamp with time zone NOT NULL DEFAULT now(),
	"updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "chat_sync_channel_links_pkey" PRIMARY KEY ("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat_sync_connections" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"organizationId" uuid NOT NULL,
	"integrationConnectionId" uuid,
	"provider" character varying(50) NOT NULL,
	"externalWorkspaceId" character varying(255) NOT NULL,
	"externalWorkspaceName" character varying(255),
	"status" public.chat_sync_connection_status NOT NULL DEFAULT 'active',
	"settings" jsonb,
	"metadata" jsonb,
	"errorMessage" text,
	"lastSyncedAt" timestamp with time zone,
	"createdBy" uuid NOT NULL,
	"createdAt" timestamp with time zone NOT NULL DEFAULT now(),
	"updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "chat_sync_connections_pkey" PRIMARY KEY ("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat_sync_event_receipts" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"syncConnectionId" uuid NOT NULL,
	"channelLinkId" uuid,
	"source" public.chat_sync_receipt_source NOT NULL,
	"externalEventId" character varying(255),
	"dedupeKey" character varying(255) NOT NULL,
	"payloadHash" character varying(128),
	"status" public.chat_sync_receipt_status NOT NULL DEFAULT 'processed',
	"errorMessage" text,
	"processedAt" timestamp with time zone NOT NULL DEFAULT now(),
	"createdAt" timestamp with time zone NOT NULL DEFAULT now(),
	CONSTRAINT "chat_sync_event_receipts_pkey" PRIMARY KEY ("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat_sync_message_links" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"channelLinkId" uuid NOT NULL,
	"hazelMessageId" uuid NOT NULL,
	"externalMessageId" character varying(255) NOT NULL,
	"source" public.chat_sync_receipt_source NOT NULL DEFAULT 'hazel',
	"rootHazelMessageId" uuid,
	"rootExternalMessageId" character varying(255),
	"hazelThreadChannelId" uuid,
	"externalThreadId" character varying(255),
	"lastSyncedAt" timestamp with time zone NOT NULL DEFAULT now(),
	"createdAt" timestamp with time zone NOT NULL DEFAULT now(),
	"updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "chat_sync_message_links_pkey" PRIMARY KEY ("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "connect_conversation_channels" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"conversationId" uuid NOT NULL,
	"organizationId" uuid NOT NULL,
	"channelId" uuid NOT NULL,
	"role" public.connect_conversation_channel_role NOT NULL,
	"allowGuestMemberAdds" boolean NOT NULL DEFAULT false,
	"isActive" boolean NOT NULL DEFAULT true,
	"createdAt" timestamp with time zone NOT NULL DEFAULT now(),
	"updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "connect_conversation_channels_pkey" PRIMARY KEY ("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "connect_conversations" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"hostOrganizationId" uuid NOT NULL,
	"hostChannelId" uuid NOT NULL,
	"status" public.connect_conversation_status NOT NULL DEFAULT 'active',
	"settings" jsonb,
	"createdBy" uuid NOT NULL,
	"createdAt" timestamp with time zone NOT NULL DEFAULT now(),
	"updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "connect_conversations_pkey" PRIMARY KEY ("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "connect_invites" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"conversationId" uuid NOT NULL,
	"hostOrganizationId" uuid NOT NULL,
	"hostChannelId" uuid NOT NULL,
	"targetKind" public.connect_invite_target_kind NOT NULL,
	"targetValue" character varying(255) NOT NULL,
	"guestOrganizationId" uuid,
	"status" public.connect_invite_status NOT NULL DEFAULT 'pending',
	"allowGuestMemberAdds" boolean NOT NULL DEFAULT false,
	"invitedBy" uuid NOT NULL,
	"acceptedBy" uuid,
	"acceptedAt" timestamp with time zone,
	"expiresAt" timestamp with time zone,
	"createdAt" timestamp with time zone NOT NULL DEFAULT now(),
	"updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "connect_invites_pkey" PRIMARY KEY ("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "connect_participants" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"conversationId" uuid NOT NULL,
	"channelId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"homeOrganizationId" uuid NOT NULL,
	"isExternal" boolean NOT NULL DEFAULT false,
	"addedBy" uuid,
	"createdAt" timestamp with time zone NOT NULL DEFAULT now(),
	"updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "connect_participants_pkey" PRIMARY KEY ("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "custom_emojis" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"organizationId" uuid NOT NULL,
	"name" character varying(64) NOT NULL,
	"imageUrl" text NOT NULL,
	"createdBy" uuid NOT NULL,
	"createdAt" timestamp with time zone NOT NULL DEFAULT now(),
	"updatedAt" timestamp with time zone,
	"deletedAt" timestamp with time zone,
	CONSTRAINT "custom_emojis_pkey" PRIMARY KEY ("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "github_subscriptions" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"channelId" uuid NOT NULL,
	"organizationId" uuid NOT NULL,
	"repositoryId" bigint NOT NULL,
	"repositoryFullName" character varying(255) NOT NULL,
	"repositoryOwner" character varying(255) NOT NULL,
	"repositoryName" character varying(255) NOT NULL,
	"enabledEvents" jsonb NOT NULL DEFAULT '["push","pull_request","issues"]',
	"branchFilter" character varying(255),
	"isEnabled" boolean NOT NULL DEFAULT true,
	"createdBy" uuid NOT NULL,
	"createdAt" timestamp with time zone NOT NULL DEFAULT now(),
	"updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "github_subscriptions_pkey" PRIMARY KEY ("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "integration_connections" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"provider" character varying(50) NOT NULL,
	"organizationId" uuid NOT NULL,
	"userId" uuid,
	"level" public.connection_level NOT NULL,
	"status" public.connection_status NOT NULL DEFAULT 'active',
	"externalAccountId" character varying(255),
	"externalAccountName" character varying(255),
	"connectedBy" uuid NOT NULL,
	"settings" jsonb,
	"metadata" jsonb,
	"errorMessage" text,
	"lastUsedAt" timestamp with time zone,
	"createdAt" timestamp with time zone NOT NULL DEFAULT now(),
	"updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "integration_connections_pkey" PRIMARY KEY ("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "integration_requests" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"organizationId" uuid NOT NULL,
	"requestedBy" uuid NOT NULL,
	"integrationName" character varying(255) NOT NULL,
	"integrationUrl" character varying(500),
	"description" text,
	"status" public.integration_request_status NOT NULL DEFAULT 'pending',
	"createdAt" timestamp with time zone NOT NULL DEFAULT now(),
	"updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
	CONSTRAINT "integration_requests_pkey" PRIMARY KEY ("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "integration_tokens" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"connectionId" uuid NOT NULL,
	"encryptedAccessToken" text NOT NULL,
	"encryptedRefreshToken" text,
	"iv" character varying(32) NOT NULL,
	"refreshTokenIv" character varying(32),
	"encryptionKeyVersion" integer NOT NULL DEFAULT 1,
	"tokenType" character varying(50) DEFAULT 'Bearer',
	"scope" text,
	"expiresAt" timestamp with time zone,
	"refreshTokenExpiresAt" timestamp with time zone,
	"lastRefreshedAt" timestamp with time zone,
	"createdAt" timestamp with time zone NOT NULL DEFAULT now(),
	"updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
	CONSTRAINT "integration_tokens_pkey" PRIMARY KEY ("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "message_outbox_events" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"sequence" bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
	"eventType" public.message_outbox_event_type NOT NULL,
	"aggregateId" uuid NOT NULL,
	"channelId" uuid NOT NULL,
	"payload" jsonb NOT NULL,
	"status" public.message_outbox_event_status NOT NULL DEFAULT 'pending',
	"attemptCount" integer NOT NULL DEFAULT 0,
	"availableAt" timestamp with time zone NOT NULL DEFAULT now(),
	"lockedAt" timestamp with time zone,
	"lockedBy" character varying(255),
	"lastError" text,
	"processedAt" timestamp with time zone,
	"createdAt" timestamp with time zone NOT NULL DEFAULT now(),
	CONSTRAINT "message_outbox_events_pkey" PRIMARY KEY ("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "message_reactions" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"messageId" uuid NOT NULL,
	"channelId" uuid NOT NULL,
	"conversationId" uuid,
	"userId" uuid NOT NULL,
	"emoji" character varying(50) NOT NULL,
	"createdAt" timestamp with time zone NOT NULL DEFAULT now(),
	CONSTRAINT "message_reactions_pkey" PRIMARY KEY ("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "messages" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"channelId" uuid NOT NULL,
	"conversationId" uuid,
	"authorId" uuid NOT NULL,
	"content" text NOT NULL,
	"embeds" jsonb,
	"replyToMessageId" uuid,
	"threadChannelId" uuid,
	"createdAt" timestamp with time zone NOT NULL DEFAULT now(),
	"updatedAt" timestamp with time zone,
	"deletedAt" timestamp with time zone,
	CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"memberId" uuid NOT NULL,
	"targetedResourceId" uuid,
	"targetedResourceType" character varying(50),
	"resourceId" uuid,
	"resourceType" character varying(50),
	"createdAt" timestamp with time zone NOT NULL DEFAULT now(),
	"readAt" timestamp with time zone,
	CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organization_members" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"organizationId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"role" public.organization_role NOT NULL DEFAULT 'member',
	"nickname" character varying(100),
	"joinedAt" timestamp with time zone NOT NULL DEFAULT now(),
	"invitedBy" uuid,
	"metadata" jsonb,
	"createdAt" timestamp with time zone NOT NULL DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organizations" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"name" character varying(255) NOT NULL,
	"slug" character varying(100),
	"logoUrl" text,
	"settings" jsonb,
	"isPublic" boolean NOT NULL DEFAULT false,
	"createdAt" timestamp with time zone NOT NULL DEFAULT now(),
	"updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pinned_messages" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"channelId" uuid NOT NULL,
	"messageId" uuid NOT NULL,
	"pinnedBy" uuid NOT NULL,
	"pinnedAt" timestamp with time zone NOT NULL DEFAULT now(),
	CONSTRAINT "pinned_messages_pkey" PRIMARY KEY ("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rss_posted_items" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"subscriptionId" uuid NOT NULL,
	"itemGuid" text NOT NULL,
	"itemUrl" text,
	"messageId" uuid,
	"postedAt" timestamp with time zone NOT NULL DEFAULT now(),
	CONSTRAINT "rss_posted_items_pkey" PRIMARY KEY ("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rss_subscriptions" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"channelId" uuid NOT NULL,
	"organizationId" uuid NOT NULL,
	"feedUrl" text NOT NULL,
	"feedTitle" character varying(255),
	"feedIconUrl" text,
	"lastFetchedAt" timestamp with time zone,
	"lastItemPublishedAt" timestamp with time zone,
	"lastItemGuid" text,
	"consecutiveErrors" integer NOT NULL DEFAULT 0,
	"lastErrorMessage" text,
	"lastErrorAt" timestamp with time zone,
	"isEnabled" boolean NOT NULL DEFAULT true,
	"pollingIntervalMinutes" integer NOT NULL DEFAULT 15,
	"createdBy" uuid NOT NULL,
	"createdAt" timestamp with time zone NOT NULL DEFAULT now(),
	"updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "rss_subscriptions_pkey" PRIMARY KEY ("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "typing_indicators" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"channelId" uuid NOT NULL,
	"memberId" uuid NOT NULL,
	"lastTyped" bigint NOT NULL,
	CONSTRAINT "typing_indicators_pkey" PRIMARY KEY ("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_presence_status" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"userId" uuid NOT NULL,
	"status" public.user_presence_status_enum NOT NULL DEFAULT 'online',
	"customMessage" character varying(255),
	"statusEmoji" character varying(10),
	"statusExpiresAt" timestamp with time zone,
	"activeChannelId" uuid,
	"suppressNotifications" boolean NOT NULL DEFAULT false,
	"updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
	"lastSeenAt" timestamp with time zone NOT NULL DEFAULT now(),
	CONSTRAINT "user_presence_status_pkey" PRIMARY KEY ("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"externalId" character varying(255) NOT NULL,
	"email" character varying(255) NOT NULL,
	"firstName" character varying(100) NOT NULL,
	"lastName" character varying(100) NOT NULL,
	"avatarUrl" text,
	"userType" public.user_type NOT NULL DEFAULT 'user',
	"settings" jsonb,
	"isOnboarded" boolean NOT NULL DEFAULT false,
	"timezone" character varying(100),
	"createdAt" timestamp with time zone NOT NULL DEFAULT now(),
	"updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "attachments_channel_id_idx" ON "attachments" USING btree ("channelId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "attachments_deleted_at_idx" ON "attachments" USING btree ("deletedAt");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "attachments_message_id_idx" ON "attachments" USING btree ("messageId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "attachments_message_uploaded_at_idx" ON "attachments" USING btree ("messageId", "uploadedAt");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "attachments_organization_id_idx" ON "attachments" USING btree ("organizationId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "attachments_status_idx" ON "attachments" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "attachments_uploaded_by_idx" ON "attachments" USING btree ("uploadedBy");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bot_commands_bot_id_idx" ON "bot_commands" USING btree ("botId");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "bot_commands_bot_id_name_idx" ON "bot_commands" USING btree ("botId", "name");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bot_installations_bot_idx" ON "bot_installations" USING btree ("botId");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "bot_installations_bot_org_unique" ON "bot_installations" USING btree ("botId", "organizationId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bot_installations_org_idx" ON "bot_installations" USING btree ("organizationId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bots_created_by_idx" ON "bots" USING btree ("createdBy");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bots_deleted_at_idx" ON "bots" USING btree ("deletedAt");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bots_is_public_idx" ON "bots" USING btree ("isPublic");
--> statement-breakpoint
ALTER TABLE "bots" ADD CONSTRAINT "bots_userId_unique" UNIQUE ("userId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bots_user_id_idx" ON "bots" USING btree ("userId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_access_channel_id_idx" ON "channel_access" USING btree ("channelId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_access_org_user_idx" ON "channel_access" USING btree ("organizationId", "userId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_access_organization_id_idx" ON "channel_access" USING btree ("organizationId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_access_user_id_idx" ON "channel_access" USING btree ("userId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_members_channel_id_idx" ON "channel_members" USING btree ("channelId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_members_channel_user_idx" ON "channel_members" USING btree ("channelId", "userId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_members_user_id_idx" ON "channel_members" USING btree ("userId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_sections_deleted_at_idx" ON "channel_sections" USING btree ("deletedAt");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_sections_order_idx" ON "channel_sections" USING btree ("organizationId", "order");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_sections_organization_id_idx" ON "channel_sections" USING btree ("organizationId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_webhooks_bot_user_id_idx" ON "channel_webhooks" USING btree ("botUserId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_webhooks_channel_id_idx" ON "channel_webhooks" USING btree ("channelId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_webhooks_deleted_at_idx" ON "channel_webhooks" USING btree ("deletedAt");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_webhooks_organization_id_idx" ON "channel_webhooks" USING btree ("organizationId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channel_webhooks_token_hash_idx" ON "channel_webhooks" USING btree ("tokenHash");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channels_deleted_at_idx" ON "channels" USING btree ("deletedAt");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channels_organization_id_idx" ON "channels" USING btree ("organizationId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channels_parent_channel_id_idx" ON "channels" USING btree ("parentChannelId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channels_section_id_idx" ON "channels" USING btree ("sectionId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "channels_type_idx" ON "channels" USING btree ("type");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "chat_sync_link_connection_external_unique" ON "chat_sync_channel_links" USING btree ("syncConnectionId", "externalChannelId") WHERE "deletedAt" IS NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "chat_sync_link_connection_hazel_unique" ON "chat_sync_channel_links" USING btree ("syncConnectionId", "hazelChannelId") WHERE "deletedAt" IS NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_sync_link_connection_idx" ON "chat_sync_channel_links" USING btree ("syncConnectionId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_sync_link_deleted_at_idx" ON "chat_sync_channel_links" USING btree ("deletedAt");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_sync_link_external_channel_idx" ON "chat_sync_channel_links" USING btree ("externalChannelId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_sync_link_hazel_channel_idx" ON "chat_sync_channel_links" USING btree ("hazelChannelId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_sync_conn_deleted_at_idx" ON "chat_sync_connections" USING btree ("deletedAt");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_sync_conn_integration_idx" ON "chat_sync_connections" USING btree ("integrationConnectionId");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "chat_sync_conn_integration_unique" ON "chat_sync_connections" USING btree ("integrationConnectionId") WHERE "deletedAt" IS NULL AND "integrationConnectionId" IS NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_sync_conn_org_idx" ON "chat_sync_connections" USING btree ("organizationId");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "chat_sync_conn_org_provider_workspace_unique" ON "chat_sync_connections" USING btree ("organizationId", "provider", "externalWorkspaceId") WHERE "deletedAt" IS NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_sync_conn_provider_idx" ON "chat_sync_connections" USING btree ("provider");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_sync_conn_status_idx" ON "chat_sync_connections" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_sync_receipt_channel_link_idx" ON "chat_sync_event_receipts" USING btree ("channelLinkId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_sync_receipt_connection_idx" ON "chat_sync_event_receipts" USING btree ("syncConnectionId");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "chat_sync_receipt_dedupe_unique" ON "chat_sync_event_receipts" USING btree ("syncConnectionId", "source", "dedupeKey");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_sync_receipt_processed_at_idx" ON "chat_sync_event_receipts" USING btree ("processedAt");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_sync_receipt_source_idx" ON "chat_sync_event_receipts" USING btree ("source");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_sync_msg_link_channel_idx" ON "chat_sync_message_links" USING btree ("channelLinkId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_sync_msg_link_deleted_at_idx" ON "chat_sync_message_links" USING btree ("deletedAt");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_sync_msg_link_external_message_idx" ON "chat_sync_message_links" USING btree ("externalMessageId");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "chat_sync_msg_link_external_unique" ON "chat_sync_message_links" USING btree ("channelLinkId", "externalMessageId") WHERE "deletedAt" IS NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_sync_msg_link_hazel_message_idx" ON "chat_sync_message_links" USING btree ("hazelMessageId");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "chat_sync_msg_link_hazel_unique" ON "chat_sync_message_links" USING btree ("channelLinkId", "hazelMessageId") WHERE "deletedAt" IS NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_sync_msg_link_root_hazel_idx" ON "chat_sync_message_links" USING btree ("rootHazelMessageId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "connect_conv_channels_channel_idx" ON "connect_conversation_channels" USING btree ("channelId");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "connect_conv_channels_channel_unique" ON "connect_conversation_channels" USING btree ("channelId") WHERE "deletedAt" IS NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "connect_conv_channels_conversation_idx" ON "connect_conversation_channels" USING btree ("conversationId");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "connect_conv_channels_conversation_org_unique" ON "connect_conversation_channels" USING btree ("conversationId", "organizationId") WHERE "deletedAt" IS NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "connect_conv_channels_deleted_at_idx" ON "connect_conversation_channels" USING btree ("deletedAt");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "connect_conv_channels_org_idx" ON "connect_conversation_channels" USING btree ("organizationId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "connect_conversations_deleted_at_idx" ON "connect_conversations" USING btree ("deletedAt");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "connect_conversations_host_channel_idx" ON "connect_conversations" USING btree ("hostChannelId");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "connect_conversations_host_channel_unique" ON "connect_conversations" USING btree ("hostChannelId") WHERE "deletedAt" IS NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "connect_conversations_host_org_idx" ON "connect_conversations" USING btree ("hostOrganizationId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "connect_conversations_status_idx" ON "connect_conversations" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "connect_invites_conversation_idx" ON "connect_invites" USING btree ("conversationId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "connect_invites_deleted_at_idx" ON "connect_invites" USING btree ("deletedAt");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "connect_invites_guest_org_idx" ON "connect_invites" USING btree ("guestOrganizationId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "connect_invites_host_org_idx" ON "connect_invites" USING btree ("hostOrganizationId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "connect_invites_status_idx" ON "connect_invites" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "connect_invites_target_idx" ON "connect_invites" USING btree ("targetKind", "targetValue");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "connect_participants_channel_idx" ON "connect_participants" USING btree ("channelId");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "connect_participants_channel_user_unique" ON "connect_participants" USING btree ("channelId", "userId") WHERE "deletedAt" IS NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "connect_participants_conversation_idx" ON "connect_participants" USING btree ("conversationId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "connect_participants_deleted_at_idx" ON "connect_participants" USING btree ("deletedAt");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "connect_participants_user_idx" ON "connect_participants" USING btree ("userId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "custom_emojis_deleted_at_idx" ON "custom_emojis" USING btree ("deletedAt");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "custom_emojis_name_idx" ON "custom_emojis" USING btree ("name");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "custom_emojis_org_name_unique_idx" ON "custom_emojis" USING btree ("organizationId", "name") WHERE "deletedAt" IS NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "custom_emojis_organization_id_idx" ON "custom_emojis" USING btree ("organizationId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "github_subscriptions_channel_id_idx" ON "github_subscriptions" USING btree ("channelId");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "github_subscriptions_channel_repo_unique" ON "github_subscriptions" USING btree ("channelId", "repositoryId") WHERE "deletedAt" IS NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "github_subscriptions_deleted_at_idx" ON "github_subscriptions" USING btree ("deletedAt");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "github_subscriptions_organization_id_idx" ON "github_subscriptions" USING btree ("organizationId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "github_subscriptions_repository_id_idx" ON "github_subscriptions" USING btree ("repositoryId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "int_conn_deleted_at_idx" ON "integration_connections" USING btree ("deletedAt");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "int_conn_github_installation_idx" ON "integration_connections" USING btree (("metadata" ->> 'installationId'));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "int_conn_org_idx" ON "integration_connections" USING btree ("organizationId");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "int_conn_org_provider_external_user_unique" ON "integration_connections" USING btree ("organizationId", "provider", "externalAccountId") WHERE "deletedAt" IS NULL
					AND "level" = 'user'
					AND "externalAccountId" IS NOT NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "int_conn_org_user_provider_unique" ON "integration_connections" USING btree ("organizationId", "userId", "provider");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "int_conn_provider_idx" ON "integration_connections" USING btree ("provider");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "int_conn_status_idx" ON "integration_connections" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "integration_requests_created_at_idx" ON "integration_requests" USING btree ("createdAt");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "integration_requests_organization_id_idx" ON "integration_requests" USING btree ("organizationId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "integration_requests_status_idx" ON "integration_requests" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "int_tokens_connection_id_idx" ON "integration_tokens" USING btree ("connectionId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "int_tokens_expires_at_idx" ON "integration_tokens" USING btree ("expiresAt");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "int_tokens_key_version_idx" ON "integration_tokens" USING btree ("encryptionKeyVersion");
--> statement-breakpoint
ALTER TABLE "integration_tokens" ADD CONSTRAINT "integration_tokens_connectionId_unique" UNIQUE ("connectionId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "message_outbox_events_channel_sequence_idx" ON "message_outbox_events" USING btree ("channelId", "sequence");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "message_outbox_events_created_at_idx" ON "message_outbox_events" USING btree ("createdAt");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "message_outbox_events_locked_at_idx" ON "message_outbox_events" USING btree ("lockedAt") WHERE "status" = 'processing';
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "message_outbox_events_sequence_unique" ON "message_outbox_events" USING btree ("sequence");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "message_outbox_events_status_available_sequence_idx" ON "message_outbox_events" USING btree ("status", "availableAt", "sequence");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reactions_channel_id_idx" ON "message_reactions" USING btree ("channelId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reactions_conversation_id_idx" ON "message_reactions" USING btree ("conversationId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reactions_message_id_idx" ON "message_reactions" USING btree ("messageId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reactions_message_user_emoji_idx" ON "message_reactions" USING btree ("messageId", "userId", "emoji");
--> statement-breakpoint
ALTER TABLE "message_reactions" ADD CONSTRAINT "reactions_message_user_emoji_unique" UNIQUE ("messageId", "userId", "emoji");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reactions_user_id_idx" ON "message_reactions" USING btree ("userId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messages_author_id_idx" ON "messages" USING btree ("authorId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messages_channel_id_idx" ON "messages" USING btree ("channelId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messages_conversation_id_idx" ON "messages" USING btree ("conversationId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messages_created_at_idx" ON "messages" USING btree ("createdAt");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messages_deleted_at_idx" ON "messages" USING btree ("deletedAt");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messages_reply_to_idx" ON "messages" USING btree ("replyToMessageId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messages_thread_channel_idx" ON "messages" USING btree ("threadChannelId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_member_created_id_idx" ON "notifications" USING btree ("memberId", "createdAt", "id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_member_id_idx" ON "notifications" USING btree ("memberId");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "notifications_message_channel_dedupe_idx" ON "notifications" USING btree ("memberId", "resourceId", "targetedResourceId") WHERE "resourceType" = 'message' AND "targetedResourceType" = 'channel';
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_read_at_idx" ON "notifications" USING btree ("readAt");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_resource_idx" ON "notifications" USING btree ("resourceId", "resourceType");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_targeted_resource_idx" ON "notifications" USING btree ("targetedResourceId", "targetedResourceType");
--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "org_members_org_user_unique" UNIQUE ("organizationId", "userId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "org_members_organization_id_idx" ON "organization_members" USING btree ("organizationId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "org_members_user_id_idx" ON "organization_members" USING btree ("userId");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "organizations_clerk_org_id_unique" ON "organizations" USING btree (("settings" ->> 'clerkOrganizationId')) WHERE "deletedAt" IS NULL AND "settings"->>'clerkOrganizationId' IS NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "organizations_deleted_at_idx" ON "organizations" USING btree ("deletedAt");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "organizations_slug_idx" ON "organizations" USING btree ("slug");
--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_slug_unique" UNIQUE ("slug");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pinned_messages_channel_id_idx" ON "pinned_messages" USING btree ("channelId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pinned_messages_message_id_idx" ON "pinned_messages" USING btree ("messageId");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "pinned_messages_unique_idx" ON "pinned_messages" USING btree ("channelId", "messageId");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "rss_posted_items_sub_guid_unique" ON "rss_posted_items" USING btree ("subscriptionId", "itemGuid");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rss_posted_items_subscription_id_idx" ON "rss_posted_items" USING btree ("subscriptionId");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "rss_subscriptions_channel_feed_unique" ON "rss_subscriptions" USING btree ("channelId", "feedUrl") WHERE "deletedAt" IS NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rss_subscriptions_channel_id_idx" ON "rss_subscriptions" USING btree ("channelId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rss_subscriptions_deleted_at_idx" ON "rss_subscriptions" USING btree ("deletedAt");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rss_subscriptions_organization_id_idx" ON "rss_subscriptions" USING btree ("organizationId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rss_subscriptions_poll_idx" ON "rss_subscriptions" USING btree ("isEnabled", "lastFetchedAt", "deletedAt");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "typing_indicators_channel_member_unique" ON "typing_indicators" USING btree ("channelId", "memberId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "typing_indicators_channel_timestamp_idx" ON "typing_indicators" USING btree ("channelId", "lastTyped");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "typing_indicators_timestamp_idx" ON "typing_indicators" USING btree ("lastTyped");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_presence_status_active_channel_idx" ON "user_presence_status" USING btree ("activeChannelId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_presence_status_last_seen_idx" ON "user_presence_status" USING btree ("lastSeenAt");
--> statement-breakpoint
ALTER TABLE "user_presence_status" ADD CONSTRAINT "user_presence_status_userId_unique" UNIQUE ("userId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_presence_status_user_id_idx" ON "user_presence_status" USING btree ("userId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_deleted_at_idx" ON "users" USING btree ("deletedAt");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users" USING btree ("email");
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_externalId_unique" UNIQUE ("externalId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_external_id_idx" ON "users" USING btree ("externalId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_user_type_idx" ON "users" USING btree ("userType");
--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE CASCADE;
