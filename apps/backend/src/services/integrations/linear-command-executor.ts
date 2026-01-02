/**
 * Linear Command Executor - Re-exports from shared package
 *
 * This file re-exports the shared Linear API client from @hazel/integrations
 * for backwards compatibility with existing backend code.
 */

import { Linear } from "@hazel/integrations"
import { Effect, Schema } from "effect"

// ============ Re-export types from shared package ============

export type { LinearIssueCreated as LinearIssueCreatedResult } from "@hazel/integrations/linear"

// ============ Backend-specific Error Type ============

/**
 * Error for when Linear command execution fails (used in backend commands)
 */
export class LinearCommandError extends Schema.TaggedError<LinearCommandError>()("LinearCommandError", {
	message: Schema.String,
	cause: Schema.optional(Schema.Unknown),
}) {}

// ============ Convenience Functions ============

/**
 * Get the default team ID for the authenticated user.
 */
export const getDefaultTeamId = (accessToken: string) =>
	Effect.gen(function* () {
		const client = yield* Linear.LinearApiClient
		return yield* client.getDefaultTeam(accessToken)
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
 * Create a new Linear issue.
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
