import type {
	ActionBuilder,
	ArgsArrayForOptionalValidator,
	ArgsArrayToObject,
	DefaultArgsForOptionalValidator,
	DefaultFunctionArgs,
	FunctionVisibility,
	GenericActionCtx,
	GenericDataModel,
	GenericMutationCtx,
	GenericQueryCtx,
	MutationBuilder,
	QueryBuilder,
	RegisteredAction,
	RegisteredMutation,
	RegisteredQuery,
	ReturnValueForOptionalValidator,
} from "convex/server"
/**
 * This file contains helpers for defining custom functions that modify the
 * context and arguments of a Convex function. Allows you to:
 *
 * - Run authentication logic before the request starts.
 * - Look up commonly used data and add it to the ctx argument.
 * - Replace a ctx or argument field with a different value, such as a version
 *   of `db` that runs custom functions on data access.
 * - Consume arguments from the client that are not passed to the query, such
 *   as taking in an authentication parameter like an API key or session ID.
 *   These arguments must be sent up by the client along with each request.
 */
import type { GenericValidator, ObjectType, PropertyValidators, Validator } from "convex/values"
import { asObjectValidator, v } from "convex/values"
import { omit, pick } from "./utils"

/**
 * A modifier for a query, mutation, or action.
 *
 * This defines what arguments are required for the modifier, and how to modify
 * the ctx and args. If the required args are not returned, they will not be
 * provided for the modified function. All returned ctx and args will show up
 * in the type signature for the modified function.
 * To remove something from `ctx`, you can return it as `undefined`.
 */
export type Mod<
	Ctx extends Record<string, any>,
	ModArgsValidator extends PropertyValidators,
	ModCtx extends Record<string, any>,
	ModMadeArgs extends Record<string, any>,
> = {
	args: ModArgsValidator
	input: (
		ctx: Ctx,
		args: ObjectType<ModArgsValidator>,
	) => Promise<{ ctx: ModCtx; args: ModMadeArgs }> | { ctx: ModCtx; args: ModMadeArgs }
}

/**
 * A helper for defining a Mod when your mod doesn't need to add or remove
 * anything from args.
 * @param mod A function that defines how to modify the ctx.
 * @returns A ctx delta to be applied to the original ctx.
 */
export function customCtx<InCtx extends Record<string, any>, OutCtx extends Record<string, any>>(
	mod: (original: InCtx) => Promise<OutCtx> | OutCtx,
	// biome-ignore lint/complexity/noBannedTypes: <explanation>
): Mod<InCtx, {}, OutCtx, {}> {
	return {
		args: {},
		input: async (ctx) => ({ ctx: await mod(ctx), args: {} }),
	}
}

/**
 * A Mod that doesn't add or remove any context or args.
 */
export const NoOp = {
	args: {},
	input() {
		return { args: {}, ctx: {} }
	},
}

/**
 * customQuery helps define custom behavior on top of `query` or `internalQuery`
 * by passing a function that modifies the ctx and args.
 *
 * Example usage:
 * ```js
 * const myQueryBuilder = customQuery(query, {
 *   args: { sessionId: v.id("sessions") },
 *   input: async (ctx, args) => {
 *     const user = await getUserOrNull(ctx);
 *     const session = await db.get(sessionId);
 *     const db = wrapDatabaseReader({ user }, ctx.db, rlsRules);
 *     return { ctx: { db, user, session }, args: {} };
 *   },
 * });
 *
 * // Using the custom builder
 * export const getSomeData = myQueryBuilder({
 *   args: { someArg: v.string() },
 *   handler: async (ctx, args) => {
 *     const { db, user, session, scheduler } = ctx;
 *     const { someArg } = args;
 *     // ...
 *   }
 * });
 * ```
 *
 * Simple usage only modifying ctx:
 * ```js
 * const myInternalQuery = customQuery(
 *   internalQuery,
 *   customCtx(async (ctx) => {
 *     return {
 *       // Throws an exception if the user isn't logged in
 *       user: await getUserByTokenIdentifier(ctx),
 *     };
 *   })
 * );
 *
 * // Using it
 * export const getUser = myInternalQuery({
 *   args: {},
 *   handler: async (ctx, args) => {
 *     return ctx.user;
 *   },
 * });
 *
 * @param query The query to be modified. Usually `query` or `internalQuery`
 *   from `_generated/server`.
 * @param mod The modifier to be applied to the query, changing ctx and args.
 * @returns A new query builder to define queries with modified ctx and args.
 */
export function customQuery<
	ModArgsValidator extends PropertyValidators,
	ModCtx extends Record<string, any>,
	ModMadeArgs extends Record<string, any>,
	Visibility extends FunctionVisibility,
	DataModel extends GenericDataModel,
>(
	query: QueryBuilder<DataModel, Visibility>,
	mod: Mod<GenericQueryCtx<DataModel>, ModArgsValidator, ModCtx, ModMadeArgs>,
) {
	return customFnBuilder(query, mod) as CustomBuilder<
		"query",
		ModArgsValidator,
		ModCtx,
		ModMadeArgs,
		GenericQueryCtx<DataModel>,
		Visibility
	>
}

/**
 * customMutation helps define custom behavior on top of `mutation`
 * or `internalMutation` by passing a function that modifies the ctx and args.
 *
 * Example usage:
 * ```js
 * const myMutationBuilder = customMutation(mutation, {
 *   args: { sessionId: v.id("sessions") },
 *   input: async (ctx, args) => {
 *     const user = await getUserOrNull(ctx);
 *     const session = await db.get(sessionId);
 *     const db = wrapDatabaseReader({ user }, ctx.db, rlsRules);
 *     return { ctx: { db, user, session }, args: {} };
 *   },
 * });
 *
 * // Using the custom builder
 * export const setSomeData = myMutationBuilder({
 *   args: { someArg: v.string() },
 *   handler: async (ctx, args) => {
 *     const { db, user, session, scheduler } = ctx;
 *     const { someArg } = args;
 *     // ...
 *   }
 * });
 * ```
 *
 * Simple usage only modifying ctx:
 * ```js
 * const myUserMutation = customMutation(
 *   mutation,
 *   customCtx(async (ctx) => {
 *     return {
 *       // Throws an exception if the user isn't logged in
 *       user: await getUserByTokenIdentifier(ctx),
 *     };
 *   })
 * );
 *
 * // Using it
 * export const setMyName = myUserMutation({
 *   args: { name: v.string() },
 *   handler: async (ctx, args) => {
 *     await ctx.db.patch(ctx.user._id, { name: args.name });
 *   },
 * });
 *
 * @param mutation The mutation to be modified. Usually `mutation` or `internalMutation`
 *   from `_generated/server`.
 * @param mod The modifier to be applied to the mutation, changing ctx and args.
 * @returns A new mutation builder to define queries with modified ctx and args.
 */
export function customMutation<
	ModArgsValidator extends PropertyValidators,
	ModCtx extends Record<string, any>,
	ModMadeArgs extends Record<string, any>,
	Visibility extends FunctionVisibility,
	DataModel extends GenericDataModel,
>(
	mutation: MutationBuilder<DataModel, Visibility>,
	mod: Mod<GenericMutationCtx<DataModel>, ModArgsValidator, ModCtx, ModMadeArgs>,
) {
	return customFnBuilder(mutation, mod) as CustomBuilder<
		"mutation",
		ModArgsValidator,
		ModCtx,
		ModMadeArgs,
		GenericMutationCtx<DataModel>,
		Visibility
	>
}

/**
 * customAction helps define custom behavior on top of `action`
 * or `internalAction` by passing a function that modifies the ctx and args.
 *
 * Example usage:
 * ```js
 * const myActionBuilder = customAction(action, {
 *   args: { secretKey: v.string() },
 *   input: async (ctx, args) => {
 *     // Very basic authorization, e.g. from trusted backends.
 *     if (args.secretKey !== process.env.SECRET_KEY) {
 *       throw new Error("Invalid secret key");
 *     }
 *     const user = await ctx.runQuery(internal.users.getUser, {});
 *     return { ctx: { user }, args: {} };
 *   },
 * });
 *
 * // Using the custom builder
 * export const runSomeAction = myActionBuilder({
 *   args: { someArg: v.string() },
 *   handler: async (ctx, args) => {
 *     const { user, scheduler } = ctx;
 *     const { someArg } = args;
 *     // ...
 *   }
 * });
 * ```
 *
 * Simple usage only modifying ctx:
 * ```js
 * const myUserAction = customAction(
 *   internalAction,
 *   customCtx(async (ctx) => {
 *     return {
 *       // Throws an exception if the user isn't logged in
 *       user: await ctx.runQuery(internal.users.getUser, {});
 *     };
 *   })
 * );
 *
 * // Using it
 * export const sendUserEmail = myUserAction({
 *   args: { subject: v.string(), body: v.string() },
 *   handler: async (ctx, args) => {
 *     await sendEmail(ctx.user.email, args.subject, args.body);
 *   },
 * });
 *
 * @param action The action to be modified. Usually `action` or `internalAction`
 *   from `_generated/server`.
 * @param mod The modifier to be applied to the action, changing ctx and args.
 * @returns A new action builder to define queries with modified ctx and args.
 */
export function customAction<
	ModArgsValidator extends PropertyValidators,
	ModCtx extends Record<string, any>,
	ModMadeArgs extends Record<string, any>,
	Visibility extends FunctionVisibility,
	DataModel extends GenericDataModel,
>(
	action: ActionBuilder<DataModel, Visibility>,
	mod: Mod<GenericActionCtx<DataModel>, ModArgsValidator, ModCtx, ModMadeArgs>,
): CustomBuilder<"action", ModArgsValidator, ModCtx, ModMadeArgs, GenericActionCtx<DataModel>, Visibility> {
	return customFnBuilder(action, mod) as CustomBuilder<
		"action",
		ModArgsValidator,
		ModCtx,
		ModMadeArgs,
		GenericActionCtx<DataModel>,
		Visibility
	>
}

function customFnBuilder(builder: (args: any) => any, mod: Mod<any, any, any, any>) {
	// Looking forward to when input / args / ... are optional
	const inputMod = mod.input ?? NoOp.input
	const inputArgs = mod.args ?? NoOp.args
	return function customBuilder(fn: any): any {
		const handler = fn.handler ?? fn
		if ("args" in fn) {
			return builder({
				args: addArgs(fn.args, inputArgs),
				returns: fn.returns,
				handler: async (ctx: any, allArgs: any) => {
					const added = await inputMod(ctx, pick(allArgs, Object.keys(inputArgs)) as any)
					const args = omit(allArgs, Object.keys(inputArgs))
					return handler({ ...ctx, ...added.ctx }, { ...args, ...added.args })
				},
			})
		}
		if (Object.keys(inputArgs).length > 0) {
			throw new Error(
				"If you're using a custom function with arguments for the input " +
					"modifier, you must declare the arguments for the function too.",
			)
		}
		return builder({
			returns: fn.returns,
			handler: async (ctx: any, args: any) => {
				const added = await inputMod(ctx, args)
				return handler({ ...ctx, ...added.ctx }, { ...args, ...added.args })
			},
		})
	}
}

// Adds args to a property validator or validator
// Needs to call recursively in the case of unions.
function addArgs(
	validatorOrPropertyValidator: PropertyValidators | Validator<any, any, any>,
	args: PropertyValidators,
): Validator<any, any, any> {
	if (Object.keys(args).length === 0) {
		return asObjectValidator(validatorOrPropertyValidator)
	}
	const validator = asObjectValidator(validatorOrPropertyValidator)
	switch (validator.kind) {
		case "object":
			return v.object({ ...validator.fields, ...args })
		case "union":
			return v.union(...validator.members.map((m) => addArgs(m, args)))
		default:
			throw new Error("Cannot add arguments to a validator that is not an object or union.")
	}
}

/**
 * A Convex function (query, mutation, or action) to be registered for the API.
 * Convenience to specify the registration type based on function type.
 */
export type Registration<
	FuncType extends "query" | "mutation" | "action",
	Visibility extends FunctionVisibility,
	Args extends DefaultFunctionArgs,
	Output,
> = {
	query: RegisteredQuery<Visibility, Args, Output>
	mutation: RegisteredMutation<Visibility, Args, Output>
	action: RegisteredAction<Visibility, Args, Output>
}[FuncType]

/*
 * Hack! This type causes TypeScript to simplify how it renders object types.
 *
 * It is functionally the identity for object types, but in practice it can
 * simplify expressions like `A & B`.
 */
type Expand<ObjectType extends Record<any, any>> = ObjectType extends Record<any, any>
	? {
			[Key in keyof ObjectType]: ObjectType[Key]
		}
	: never

type ArgsForHandlerType<
	OneOrZeroArgs extends [] | [Record<string, any>],
	ModMadeArgs extends Record<string, any>,
> = ModMadeArgs extends Record<string, never>
	? OneOrZeroArgs
	: OneOrZeroArgs extends [infer A]
		? [Expand<A & ModMadeArgs>]
		: [ModMadeArgs]

/**
 * A builder that customizes a Convex function, whether or not it validates
 * arguments. If the customization requires arguments, however, the resulting
 * builder will require argument validation too.
 */
export type CustomBuilder<
	FuncType extends "query" | "mutation" | "action",
	ModArgsValidator extends PropertyValidators,
	ModCtx extends Record<string, any>,
	ModMadeArgs extends Record<string, any>,
	InputCtx,
	Visibility extends FunctionVisibility,
> = <
	ArgsValidator extends PropertyValidators | void | Validator<any, any, any>,
	ReturnsValidator extends PropertyValidators | GenericValidator | void,
	ReturnValue extends ReturnValueForOptionalValidator<ReturnsValidator> = any,
	OneOrZeroArgs extends
		ArgsArrayForOptionalValidator<ArgsValidator> = DefaultArgsForOptionalValidator<ArgsValidator>,
>(
	func:
		| {
				args?: ArgsValidator
				returns?: ReturnsValidator
				handler: (
					ctx: Overwrite<InputCtx, ModCtx>,
					...args: ArgsForHandlerType<OneOrZeroArgs, ModMadeArgs>
				) => ReturnValue
		  }
		| ((
				ctx: Overwrite<InputCtx, ModCtx>,
				...args: ArgsForHandlerType<OneOrZeroArgs, ModMadeArgs>
		  ) => ReturnValue),
) => Registration<
	FuncType,
	Visibility,
	ArgsArrayToObject<
		ModArgsValidator extends Record<string, never>
			? OneOrZeroArgs
			: OneOrZeroArgs extends [infer A]
				? [Expand<A & ObjectType<ModArgsValidator>>]
				: [ObjectType<ModArgsValidator>]
	>,
	ReturnValue
>

export type CustomCtx<Builder> = Builder extends CustomBuilder<
	any,
	any,
	infer ModCtx,
	any,
	infer InputCtx,
	any
>
	? Overwrite<InputCtx, ModCtx>
	: never

type Overwrite<T, U> = Omit<T, keyof U> & U
