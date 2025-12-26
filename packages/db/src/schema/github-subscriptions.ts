import type { GitHubSubscription } from "@hazel/domain/models"
import type { ChannelId, GitHubSubscriptionId, OrganizationId, UserId } from "@hazel/schema"
import { sql } from "drizzle-orm"
import {
	bigint,
	boolean,
	index,
	jsonb,
	pgTable,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from "drizzle-orm/pg-core"

type GitHubEventType = GitHubSubscription.GitHubEventType

export const githubSubscriptionsTable = pgTable(
	"github_subscriptions",
	{
		id: uuid().primaryKey().defaultRandom().$type<GitHubSubscriptionId>(),
		channelId: uuid().notNull().$type<ChannelId>(),
		organizationId: uuid().notNull().$type<OrganizationId>(),
		repositoryId: bigint({ mode: "number" }).notNull(),
		repositoryFullName: varchar({ length: 255 }).notNull(),
		repositoryOwner: varchar({ length: 255 }).notNull(),
		repositoryName: varchar({ length: 255 }).notNull(),
		enabledEvents: jsonb()
			.$type<GitHubEventType[]>()
			.notNull()
			.default(["push", "pull_request", "issues"]),
		branchFilter: varchar({ length: 255 }),
		isEnabled: boolean().notNull().default(true),
		createdBy: uuid().notNull().$type<UserId>(),
		createdAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		deletedAt: timestamp({ mode: "date", withTimezone: true }),
	},
	(table) => [
		index("github_subscriptions_channel_id_idx").on(table.channelId),
		index("github_subscriptions_organization_id_idx").on(table.organizationId),
		index("github_subscriptions_repository_id_idx").on(table.repositoryId),
		index("github_subscriptions_deleted_at_idx").on(table.deletedAt),
		// Unique constraint: one subscription per channel-repository pair (excluding soft-deleted)
		uniqueIndex("github_subscriptions_channel_repo_unique")
			.on(table.channelId, table.repositoryId)
			.where(sql`${table.deletedAt} IS NULL`),
	],
)

// Type exports
export type GitHubSubscription = typeof githubSubscriptionsTable.$inferSelect
export type NewGitHubSubscription = typeof githubSubscriptionsTable.$inferInsert
