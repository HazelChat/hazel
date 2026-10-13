import type { GitHubSubscription as GitHubSubscriptionModel } from "@hazel/domain/models"
import { ChannelId, GitHubSubscriptionId, OrganizationId, UserId } from "@hazel/schema"
import * as PG from "@maple-dev/effect-orm/postgres"
import { jsonb, now, timestamptz, uuid, varchar } from "./columns"

type GitHubEventType = GitHubSubscriptionModel.GitHubEventType

export const githubSubscriptionsTable = PG.table("github_subscriptions", {
	columns: {
		id: PG.column(uuid(GitHubSubscriptionId), { defaultExpr: "gen_random_uuid()" }),
		channelId: uuid(ChannelId),
		organizationId: uuid(OrganizationId),
		repositoryId: PG.int8,
		repositoryFullName: varchar(255),
		repositoryOwner: varchar(255),
		repositoryName: varchar(255),
		enabledEvents: PG.column(jsonb<GitHubEventType[]>(), { default: ["push", "pull_request", "issues"] }),
		branchFilter: PG.nullable(varchar(255)),
		isEnabled: PG.column(PG.bool, { default: true }),
		createdBy: uuid(UserId),
		createdAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		updatedAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		deletedAt: PG.nullable(timestamptz),
	},
	primaryKey: ["id"],
	indexes: [
		PG.index("github_subscriptions_channel_id_idx", ["channelId"]),
		PG.index("github_subscriptions_organization_id_idx", ["organizationId"]),
		PG.index("github_subscriptions_repository_id_idx", ["repositoryId"]),
		PG.index("github_subscriptions_deleted_at_idx", ["deletedAt"]),
		PG.uniqueIndex("github_subscriptions_channel_repo_unique", ["channelId", "repositoryId"], {
			where: '"deletedAt" IS NULL',
		}),
	],
})
export type GitHubSubscription = PG.SelectRowOf<typeof githubSubscriptionsTable>
export type NewGitHubSubscription = PG.InsertRowOf<typeof githubSubscriptionsTable>
