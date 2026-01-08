CREATE TYPE "public"."attachment_status" AS ENUM('uploading', 'complete', 'failed');--> statement-breakpoint
CREATE TYPE "public"."channel_type" AS ENUM('public', 'private', 'thread', 'direct', 'single');--> statement-breakpoint
CREATE TYPE "public"."connection_level" AS ENUM('organization', 'user');--> statement-breakpoint
CREATE TYPE "public"."connection_status" AS ENUM('active', 'expired', 'revoked', 'error', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."integration_provider" AS ENUM('linear', 'github', 'figma', 'notion');--> statement-breakpoint
CREATE TYPE "public"."invitation_status" AS ENUM('pending', 'accepted', 'expired', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."organization_role" AS ENUM('admin', 'member', 'owner');--> statement-breakpoint
CREATE TYPE "public"."user_presence_status_enum" AS ENUM('online', 'away', 'busy', 'dnd', 'offline');--> statement-breakpoint
CREATE TYPE "public"."user_type" AS ENUM('user', 'machine');--> statement-breakpoint
CREATE TABLE "attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organizationId" uuid NOT NULL,
	"channelId" uuid,
	"messageId" uuid,
	"fileName" varchar(255) NOT NULL,
	"fileSize" integer NOT NULL,
	"uploadedBy" uuid NOT NULL,
	"status" "attachment_status" DEFAULT 'uploading' NOT NULL,
	"uploadedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"deletedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "bot_commands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"botId" uuid NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text NOT NULL,
	"arguments" jsonb DEFAULT '[]'::jsonb,
	"usageExample" text,
	"isEnabled" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bot_installations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"botId" uuid NOT NULL,
	"organizationId" uuid NOT NULL,
	"installedBy" uuid NOT NULL,
	"installedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"createdBy" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"webhookUrl" text,
	"apiTokenHash" text NOT NULL,
	"scopes" jsonb,
	"metadata" jsonb,
	"isPublic" boolean DEFAULT false NOT NULL,
	"installCount" integer DEFAULT 0 NOT NULL,
	"allowedIntegrations" jsonb DEFAULT '[]'::jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"deletedAt" timestamp with time zone,
	CONSTRAINT "bots_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "channel_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organizationId" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"deletedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "channel_webhooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channelId" uuid NOT NULL,
	"organizationId" uuid NOT NULL,
	"botUserId" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"avatarUrl" text,
	"tokenHash" text NOT NULL,
	"tokenSuffix" varchar(4) NOT NULL,
	"isEnabled" boolean DEFAULT true NOT NULL,
	"createdBy" uuid NOT NULL,
	"lastUsedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"deletedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "channel_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channelId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"isHidden" boolean DEFAULT false NOT NULL,
	"isMuted" boolean DEFAULT false NOT NULL,
	"isFavorite" boolean DEFAULT false NOT NULL,
	"lastSeenMessageId" uuid,
	"notificationCount" integer DEFAULT 0 NOT NULL,
	"joinedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"deletedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "channels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"icon" varchar(32),
	"type" "channel_type" NOT NULL,
	"organizationId" uuid NOT NULL,
	"parentChannelId" uuid,
	"sectionId" uuid,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"deletedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "github_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channelId" uuid NOT NULL,
	"organizationId" uuid NOT NULL,
	"repositoryId" bigint NOT NULL,
	"repositoryFullName" varchar(255) NOT NULL,
	"repositoryOwner" varchar(255) NOT NULL,
	"repositoryName" varchar(255) NOT NULL,
	"enabledEvents" jsonb DEFAULT '["push","pull_request","issues"]'::jsonb NOT NULL,
	"branchFilter" varchar(255),
	"isEnabled" boolean DEFAULT true NOT NULL,
	"createdBy" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"deletedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "integration_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" "integration_provider" NOT NULL,
	"organizationId" uuid NOT NULL,
	"userId" uuid,
	"level" "connection_level" NOT NULL,
	"status" "connection_status" DEFAULT 'active' NOT NULL,
	"externalAccountId" varchar(255),
	"externalAccountName" varchar(255),
	"connectedBy" uuid NOT NULL,
	"settings" jsonb,
	"metadata" jsonb,
	"errorMessage" text,
	"lastUsedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"deletedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "integration_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"connectionId" uuid NOT NULL,
	"encryptedAccessToken" text NOT NULL,
	"encryptedRefreshToken" text,
	"iv" varchar(32) NOT NULL,
	"refreshTokenIv" varchar(32),
	"encryptionKeyVersion" integer DEFAULT 1 NOT NULL,
	"tokenType" varchar(50) DEFAULT 'Bearer',
	"scope" text,
	"expiresAt" timestamp with time zone,
	"refreshTokenExpiresAt" timestamp with time zone,
	"lastRefreshedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "integration_tokens_connectionId_unique" UNIQUE("connectionId")
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invitationUrl" text NOT NULL,
	"workosInvitationId" varchar(255) NOT NULL,
	"organizationId" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"invitedBy" uuid,
	"invitedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"status" "invitation_status" DEFAULT 'pending' NOT NULL,
	"acceptedAt" timestamp with time zone,
	"acceptedBy" uuid,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invitations_workosInvitationId_unique" UNIQUE("workosInvitationId")
);
--> statement-breakpoint
CREATE TABLE "message_reactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"messageId" uuid NOT NULL,
	"channelId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"emoji" varchar(50) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reactions_message_user_emoji_unique" UNIQUE("messageId","userId","emoji")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channelId" uuid NOT NULL,
	"authorId" uuid NOT NULL,
	"content" text NOT NULL,
	"embeds" jsonb,
	"replyToMessageId" uuid,
	"threadChannelId" uuid,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone,
	"deletedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"memberId" uuid NOT NULL,
	"targetedResourceId" uuid,
	"targetedResourceType" varchar(50),
	"resourceId" uuid,
	"resourceType" varchar(50),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"readAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "organization_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organizationId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"role" "organization_role" DEFAULT 'member' NOT NULL,
	"nickname" varchar(100),
	"joinedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"invitedBy" uuid,
	"metadata" jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"deletedAt" timestamp with time zone,
	CONSTRAINT "org_members_org_user_unique" UNIQUE("organizationId","userId")
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100),
	"logoUrl" text,
	"settings" jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"deletedAt" timestamp with time zone,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "pinned_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channelId" uuid NOT NULL,
	"messageId" uuid NOT NULL,
	"pinnedBy" uuid NOT NULL,
	"pinnedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "typing_indicators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channelId" uuid NOT NULL,
	"memberId" uuid NOT NULL,
	"lastTyped" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_presence_status" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"status" "user_presence_status_enum" DEFAULT 'online' NOT NULL,
	"customMessage" varchar(255),
	"activeChannelId" uuid,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"lastSeenAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_presence_status_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"externalId" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"firstName" varchar(100) NOT NULL,
	"lastName" varchar(100) NOT NULL,
	"avatarUrl" text NOT NULL,
	"userType" "user_type" DEFAULT 'user' NOT NULL,
	"settings" jsonb,
	"isOnboarded" boolean DEFAULT false NOT NULL,
	"timezone" varchar(100),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"deletedAt" timestamp with time zone,
	CONSTRAINT "users_externalId_unique" UNIQUE("externalId")
);
--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attachments_organization_id_idx" ON "attachments" USING btree ("organizationId");--> statement-breakpoint
CREATE INDEX "attachments_channel_id_idx" ON "attachments" USING btree ("channelId");--> statement-breakpoint
CREATE INDEX "attachments_message_id_idx" ON "attachments" USING btree ("messageId");--> statement-breakpoint
CREATE INDEX "attachments_message_uploaded_at_idx" ON "attachments" USING btree ("messageId","uploadedAt");--> statement-breakpoint
CREATE INDEX "attachments_uploaded_by_idx" ON "attachments" USING btree ("uploadedBy");--> statement-breakpoint
CREATE INDEX "attachments_status_idx" ON "attachments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "attachments_deleted_at_idx" ON "attachments" USING btree ("deletedAt");--> statement-breakpoint
CREATE INDEX "bot_commands_bot_id_idx" ON "bot_commands" USING btree ("botId");--> statement-breakpoint
CREATE UNIQUE INDEX "bot_commands_bot_id_name_idx" ON "bot_commands" USING btree ("botId","name");--> statement-breakpoint
CREATE INDEX "bot_installations_org_idx" ON "bot_installations" USING btree ("organizationId");--> statement-breakpoint
CREATE INDEX "bot_installations_bot_idx" ON "bot_installations" USING btree ("botId");--> statement-breakpoint
CREATE UNIQUE INDEX "bot_installations_bot_org_unique" ON "bot_installations" USING btree ("botId","organizationId");--> statement-breakpoint
CREATE INDEX "bots_user_id_idx" ON "bots" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "bots_created_by_idx" ON "bots" USING btree ("createdBy");--> statement-breakpoint
CREATE INDEX "bots_is_public_idx" ON "bots" USING btree ("isPublic");--> statement-breakpoint
CREATE INDEX "bots_deleted_at_idx" ON "bots" USING btree ("deletedAt");--> statement-breakpoint
CREATE INDEX "channel_sections_organization_id_idx" ON "channel_sections" USING btree ("organizationId");--> statement-breakpoint
CREATE INDEX "channel_sections_order_idx" ON "channel_sections" USING btree ("organizationId","order");--> statement-breakpoint
CREATE INDEX "channel_sections_deleted_at_idx" ON "channel_sections" USING btree ("deletedAt");--> statement-breakpoint
CREATE INDEX "channel_webhooks_channel_id_idx" ON "channel_webhooks" USING btree ("channelId");--> statement-breakpoint
CREATE INDEX "channel_webhooks_organization_id_idx" ON "channel_webhooks" USING btree ("organizationId");--> statement-breakpoint
CREATE INDEX "channel_webhooks_bot_user_id_idx" ON "channel_webhooks" USING btree ("botUserId");--> statement-breakpoint
CREATE INDEX "channel_webhooks_token_hash_idx" ON "channel_webhooks" USING btree ("tokenHash");--> statement-breakpoint
CREATE INDEX "channel_webhooks_deleted_at_idx" ON "channel_webhooks" USING btree ("deletedAt");--> statement-breakpoint
CREATE INDEX "channel_members_channel_id_idx" ON "channel_members" USING btree ("channelId");--> statement-breakpoint
CREATE INDEX "channel_members_user_id_idx" ON "channel_members" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "channel_members_channel_user_idx" ON "channel_members" USING btree ("channelId","userId");--> statement-breakpoint
CREATE INDEX "channels_organization_id_idx" ON "channels" USING btree ("organizationId");--> statement-breakpoint
CREATE INDEX "channels_parent_channel_id_idx" ON "channels" USING btree ("parentChannelId");--> statement-breakpoint
CREATE INDEX "channels_section_id_idx" ON "channels" USING btree ("sectionId");--> statement-breakpoint
CREATE INDEX "channels_type_idx" ON "channels" USING btree ("type");--> statement-breakpoint
CREATE INDEX "channels_deleted_at_idx" ON "channels" USING btree ("deletedAt");--> statement-breakpoint
CREATE INDEX "github_subscriptions_channel_id_idx" ON "github_subscriptions" USING btree ("channelId");--> statement-breakpoint
CREATE INDEX "github_subscriptions_organization_id_idx" ON "github_subscriptions" USING btree ("organizationId");--> statement-breakpoint
CREATE INDEX "github_subscriptions_repository_id_idx" ON "github_subscriptions" USING btree ("repositoryId");--> statement-breakpoint
CREATE INDEX "github_subscriptions_deleted_at_idx" ON "github_subscriptions" USING btree ("deletedAt");--> statement-breakpoint
CREATE UNIQUE INDEX "github_subscriptions_channel_repo_unique" ON "github_subscriptions" USING btree ("channelId","repositoryId") WHERE "github_subscriptions"."deletedAt" IS NULL;--> statement-breakpoint
CREATE INDEX "int_conn_org_idx" ON "integration_connections" USING btree ("organizationId");--> statement-breakpoint
CREATE INDEX "int_conn_provider_idx" ON "integration_connections" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "int_conn_status_idx" ON "integration_connections" USING btree ("status");--> statement-breakpoint
CREATE INDEX "int_conn_deleted_at_idx" ON "integration_connections" USING btree ("deletedAt");--> statement-breakpoint
CREATE UNIQUE INDEX "int_conn_org_user_provider_unique" ON "integration_connections" USING btree ("organizationId","userId","provider");--> statement-breakpoint
CREATE INDEX "int_conn_github_installation_idx" ON "integration_connections" USING btree (("metadata"->>'installationId'));--> statement-breakpoint
CREATE INDEX "int_tokens_connection_id_idx" ON "integration_tokens" USING btree ("connectionId");--> statement-breakpoint
CREATE INDEX "int_tokens_expires_at_idx" ON "integration_tokens" USING btree ("expiresAt");--> statement-breakpoint
CREATE INDEX "int_tokens_key_version_idx" ON "integration_tokens" USING btree ("encryptionKeyVersion");--> statement-breakpoint
CREATE INDEX "invitations_workos_id_idx" ON "invitations" USING btree ("workosInvitationId");--> statement-breakpoint
CREATE INDEX "invitations_organization_id_idx" ON "invitations" USING btree ("organizationId");--> statement-breakpoint
CREATE INDEX "invitations_email_idx" ON "invitations" USING btree ("email");--> statement-breakpoint
CREATE INDEX "invitations_status_idx" ON "invitations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "reactions_channel_id_idx" ON "message_reactions" USING btree ("channelId");--> statement-breakpoint
CREATE INDEX "reactions_message_id_idx" ON "message_reactions" USING btree ("messageId");--> statement-breakpoint
CREATE INDEX "reactions_user_id_idx" ON "message_reactions" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "reactions_message_user_emoji_idx" ON "message_reactions" USING btree ("messageId","userId","emoji");--> statement-breakpoint
CREATE INDEX "messages_channel_id_idx" ON "messages" USING btree ("channelId");--> statement-breakpoint
CREATE INDEX "messages_author_id_idx" ON "messages" USING btree ("authorId");--> statement-breakpoint
CREATE INDEX "messages_reply_to_idx" ON "messages" USING btree ("replyToMessageId");--> statement-breakpoint
CREATE INDEX "messages_thread_channel_idx" ON "messages" USING btree ("threadChannelId");--> statement-breakpoint
CREATE INDEX "messages_created_at_idx" ON "messages" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "messages_deleted_at_idx" ON "messages" USING btree ("deletedAt");--> statement-breakpoint
CREATE INDEX "notifications_member_id_idx" ON "notifications" USING btree ("memberId");--> statement-breakpoint
CREATE INDEX "notifications_targeted_resource_idx" ON "notifications" USING btree ("targetedResourceId","targetedResourceType");--> statement-breakpoint
CREATE INDEX "notifications_resource_idx" ON "notifications" USING btree ("resourceId","resourceType");--> statement-breakpoint
CREATE INDEX "notifications_read_at_idx" ON "notifications" USING btree ("readAt");--> statement-breakpoint
CREATE INDEX "org_members_organization_id_idx" ON "organization_members" USING btree ("organizationId");--> statement-breakpoint
CREATE INDEX "org_members_user_id_idx" ON "organization_members" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "organizations_slug_idx" ON "organizations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "organizations_deleted_at_idx" ON "organizations" USING btree ("deletedAt");--> statement-breakpoint
CREATE INDEX "pinned_messages_channel_id_idx" ON "pinned_messages" USING btree ("channelId");--> statement-breakpoint
CREATE INDEX "pinned_messages_message_id_idx" ON "pinned_messages" USING btree ("messageId");--> statement-breakpoint
CREATE UNIQUE INDEX "pinned_messages_unique_idx" ON "pinned_messages" USING btree ("channelId","messageId");--> statement-breakpoint
CREATE UNIQUE INDEX "typing_indicators_channel_member_unique" ON "typing_indicators" USING btree ("channelId","memberId");--> statement-breakpoint
CREATE INDEX "typing_indicators_channel_timestamp_idx" ON "typing_indicators" USING btree ("channelId","lastTyped");--> statement-breakpoint
CREATE INDEX "typing_indicators_timestamp_idx" ON "typing_indicators" USING btree ("lastTyped");--> statement-breakpoint
CREATE INDEX "user_presence_status_user_id_idx" ON "user_presence_status" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "user_presence_status_active_channel_idx" ON "user_presence_status" USING btree ("activeChannelId");--> statement-breakpoint
CREATE INDEX "user_presence_status_last_seen_idx" ON "user_presence_status" USING btree ("lastSeenAt");--> statement-breakpoint
CREATE INDEX "users_external_id_idx" ON "users" USING btree ("externalId");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_user_type_idx" ON "users" USING btree ("userType");--> statement-breakpoint
CREATE INDEX "users_deleted_at_idx" ON "users" USING btree ("deletedAt");