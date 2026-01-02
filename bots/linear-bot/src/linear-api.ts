/**
 * Linear API Client - Re-exports from shared package
 *
 * This file re-exports the shared Linear API client from @hazel/integrations
 * and adds bot-specific error types.
 */

import { Linear } from "@hazel/integrations"
import { Effect, Schema } from "effect"

// ============ Re-export from shared package ============

export {
	// Domain Types
	LinearIssue,
	LinearIssueState,
	LinearIssueAssignee,
	LinearIssueLabel,
	LinearTeam,
	LinearIssueCreated,
	LinearAccountInfo,
	// Error Types
	LinearApiError,
	LinearRateLimitError,
	LinearIssueNotFoundError,
	LinearTeamNotFoundError,
	// URL Utilities
	parseLinearIssueUrl,
	isLinearIssueUrl,
	extractLinearUrls,
	// Service
	LinearApiClient,
} from "@hazel/integrations/linear"


// ============ Bot-specific Error Types ============

/**
 * Error for bot command failures (user-facing messages)
 */
export class LinearCommandError extends Schema.TaggedError<LinearCommandError>()("LinearCommandError", {
	message: Schema.String,
	cause: Schema.optional(Schema.Unknown),
}) {}

// ============ Convenience Functions ============

/**
 * Create a Linear issue using the shared client.
 * Wraps LinearApiClient.createIssue with LinearCommandError mapping.
 */
export const createIssue = (
	accessToken: string,
	params: { title: string; description?: string; teamId?: string },
) =>
	Effect.gen(function* () {
		const client = yield* Linear.LinearApiClient
		return yield* client.createIssue(accessToken, params)
	}).pipe(
		Effect.provide(Linear.LinearApiClient.Default),
		Effect.mapError(
			(error) =>
				new LinearCommandError({
					message: "message" in error ? error.message : String(error),
					cause: error,
				}),
		),
	)

/**
 * Fetch a Linear issue using the shared client.
 * Wraps LinearApiClient.fetchIssue for backwards compatibility.
 */
export const fetchLinearIssue = (issueKey: string, accessToken: string) =>
	Effect.gen(function* () {
		const client = yield* Linear.LinearApiClient
		return yield* client.fetchIssue(issueKey, accessToken)
	}).pipe(Effect.provide(Linear.LinearApiClient.Default))
