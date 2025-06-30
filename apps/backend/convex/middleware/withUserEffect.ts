import type { Id as IdType } from "@hazel/backend"
import { Id, makeGenericFunctions } from "confect-plus/server"
import type { DefaultFunctionArgs, UserIdentity } from "convex/server"
import { Effect, Option, Schema } from "effect"
import {
	type ConfectMutationCtx,
	ConfectMutationCtx as ConfectMutationCtxService,
	type ConfectQueryCtx,
	ConfectQueryCtx as ConfectQueryCtxService,
} from "../confect"
import { confectSchema } from "../schema"
import { type UserData, UserService, UserServiceLive } from "../services/UserService"

const { queryGeneric, buildQuery, mutationGeneric, buildMutation } = makeGenericFunctions(confectSchema)

/**
 * Create a userQuery helper - query with automatic current user injection
 * Rebuilt with Effect using modern Effect.fn and Effect.Service patterns
 */
// Improved types for better type safety
type UserQueryArgs<UserConfectArgs> = UserConfectArgs & {
	readonly userData: UserData
	readonly identity: UserIdentity
	readonly userService: UserService
	readonly serverId: IdType<"servers">
}

export const userQuery = <
	UserConvexArgs extends DefaultFunctionArgs,
	UserConfectArgs,
	ConvexReturns,
	ConfectReturns,
	E = never,
>({
	args: userArgs,
	returns,
	handler,
}: {
	args: Schema.Schema<UserConfectArgs, UserConvexArgs>
	returns: Schema.Schema<ConfectReturns, ConvexReturns>
	handler: (args: UserQueryArgs<UserConfectArgs>) => Effect.Effect<ConfectReturns, E, ConfectQueryCtx>
}) => {
	const ServerIdArgs = Schema.Struct({
		serverId: Id.Id("servers"),
	})
	const mergedArgs = Schema.extend(userArgs, ServerIdArgs)

	return queryGeneric(
		buildQuery({
			args: mergedArgs,
			returns,
			handler: Effect.fnUntraced(function* (mergedArgsValue) {
				const ctx = yield* ConfectQueryCtxService
				const userIdentity = yield* ctx.auth.getUserIdentity()

				if (Option.isNone(userIdentity)) {
					return yield* Effect.fail(new Error("Not authenticated"))
				}

				const userService = yield* UserService
				const userData = yield* userService.fromIdentity(
					ctx,
					userIdentity.value,
					mergedArgsValue.serverId,
				)

				const combinedArgs: UserQueryArgs<UserConfectArgs> = {
					...mergedArgsValue,
					userData,
					userService,
					identity: userIdentity.value,
					serverId: mergedArgsValue.serverId,
				}

				return yield* handler(combinedArgs)
			}, Effect.provide(UserServiceLive)),
		}),
	)
}

// Improved types for userMutation
type UserMutationArgs<UserConfectArgs> = UserConfectArgs & {
	readonly userData: UserData
	readonly userService: UserService
	readonly identity: UserIdentity
	readonly serverId: IdType<"servers">
}

/**
 * Create a userMutation helper - mutation with automatic current user injection
 * Rebuilt with Effect using modern Effect.fn and Effect.Service patterns
 */
export const userMutation = <
	UserConvexArgs extends DefaultFunctionArgs,
	UserConfectArgs,
	ConvexReturns,
	ConfectReturns,
	E = never,
>({
	args: userArgs,
	returns,
	handler,
}: {
	args: Schema.Schema<UserConfectArgs, UserConvexArgs>
	returns: Schema.Schema<ConfectReturns, ConvexReturns>
	handler: (args: UserMutationArgs<UserConfectArgs>) => Effect.Effect<ConfectReturns, E, ConfectMutationCtx>
}) => {
	const ServerIdArgs = Schema.Struct({
		serverId: Id.Id("servers"),
	})
	const mergedArgs = Schema.extend(userArgs, ServerIdArgs)

	return mutationGeneric(
		buildMutation({
			args: mergedArgs,
			returns,
			handler: Effect.fnUntraced(function* (mergedArgsValue) {
				const ctx = yield* ConfectMutationCtxService
				const userIdentity = yield* ctx.auth.getUserIdentity()

				if (Option.isNone(userIdentity)) {
					return yield* Effect.fail(new Error("Not authenticated"))
				}

				const userService = yield* UserService
				const userData = yield* userService.fromIdentity(
					ctx,
					userIdentity.value,
					mergedArgsValue.serverId,
				)

				const combinedArgs: UserMutationArgs<UserConfectArgs> = {
					...mergedArgsValue,
					userData,
					userService,
					identity: userIdentity.value,
					serverId: mergedArgsValue.serverId,
				}

				return yield* handler(combinedArgs)
			}, Effect.provide(UserServiceLive)),
		}),
	)
}
