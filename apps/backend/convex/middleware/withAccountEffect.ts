import type { Id as IdType } from "@hazel/backend"
import { makeGenericFunctions } from "confect-plus/server"
import type { DefaultFunctionArgs, UserIdentity } from "convex/server"
import { Effect, Option, Schema } from "effect"
import {
	type ConfectMutationCtx,
	ConfectMutationCtx as ConfectMutationCtxService,
	type ConfectQueryCtx,
	ConfectQueryCtx as ConfectQueryCtxService,
} from "../confect"
import { confectSchema } from "../schema"

const { queryGeneric, buildQuery, mutationGeneric, buildMutation } = makeGenericFunctions(confectSchema)

// Account data type
export interface AccountData {
	readonly account: { readonly _id: IdType<"accounts">; readonly displayName: string; readonly avatarUrl: string; readonly externalId: string; readonly tokenIdentifier: string }
	readonly identity: UserIdentity
}

// Improved types for accountQuery
type AccountQueryArgs<UserConfectArgs> = UserConfectArgs & AccountData

/**
 * Create an accountQuery helper - query with automatic account injection
 * Rebuilt with Effect using modern Effect patterns
 */
export const accountQuery = <
	UserConvexArgs extends DefaultFunctionArgs,
	UserConfectArgs,
	ConvexReturns,
	ConfectReturns,
	E = never,
>({
	args: accountArgs,
	returns,
	handler,
}: {
	args: Schema.Schema<UserConfectArgs, UserConvexArgs>
	returns: Schema.Schema<ConfectReturns, ConvexReturns>
	handler: (
		args: AccountQueryArgs<UserConfectArgs>,
	) => Effect.Effect<ConfectReturns, E, ConfectQueryCtx>
}) => {
	return queryGeneric(
		buildQuery({
			args: accountArgs,
			returns,
			handler: Effect.fnUntraced(function* (argsValue) {
				const ctx = yield* ConfectQueryCtxService
				const userIdentity = yield* ctx.auth.getUserIdentity()

				if (Option.isNone(userIdentity)) {
					return yield* Effect.fail(new Error("Not authenticated"))
				}

				// Get account from identity
				const accountOption = yield* ctx.db
					.query("accounts")
					.withIndex("bg_tokenIdentifier", (q) => q.eq("tokenIdentifier", userIdentity.value.tokenIdentifier))
					.unique()

				if (Option.isNone(accountOption)) {
					return yield* Effect.fail(new Error("Account not found"))
				}

				const account = accountOption.value

				const combinedArgs: AccountQueryArgs<UserConfectArgs> = {
					...argsValue,
					account,
					identity: userIdentity.value,
				}

				return yield* handler(combinedArgs)
			}),
		}),
	)
}

// Improved types for accountMutation
type AccountMutationArgs<UserConfectArgs> = UserConfectArgs & AccountData

/**
 * Create an accountMutation helper - mutation with automatic account injection
 * Rebuilt with Effect using modern Effect patterns
 */
export const accountMutation = <
	UserConvexArgs extends DefaultFunctionArgs,
	UserConfectArgs,
	ConvexReturns,
	ConfectReturns,
	E = never,
>({
	args: accountArgs,
	returns,
	handler,
}: {
	args: Schema.Schema<UserConfectArgs, UserConvexArgs>
	returns: Schema.Schema<ConfectReturns, ConvexReturns>
	handler: (
		args: AccountMutationArgs<UserConfectArgs>,
	) => Effect.Effect<ConfectReturns, E, ConfectMutationCtx>
}) => {
	return mutationGeneric(
		buildMutation({
			args: accountArgs,
			returns,
			handler: Effect.fnUntraced(function* (argsValue) {
				const ctx = yield* ConfectMutationCtxService
				const userIdentity = yield* ctx.auth.getUserIdentity()

				if (Option.isNone(userIdentity)) {
					return yield* Effect.fail(new Error("Not authenticated"))
				}

				// Get account from identity
				const accountOption = yield* ctx.db
					.query("accounts")
					.withIndex("bg_tokenIdentifier", (q) => q.eq("tokenIdentifier", userIdentity.value.tokenIdentifier))
					.unique()

				if (Option.isNone(accountOption)) {
					return yield* Effect.fail(new Error("Account not found"))
				}

				const account = accountOption.value

				const combinedArgs: AccountMutationArgs<UserConfectArgs> = {
					...argsValue,
					account,
					identity: userIdentity.value,
				}

				return yield* handler(combinedArgs)
			}),
		}),
	)
}