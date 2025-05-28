import type { Doc } from "convex-hazel/_generated/dataModel"
import type { QueryCtx } from "convex-hazel/_generated/server"
import { User } from "convex-hazel/lib/user"
import type {
	ArgsArrayForOptionalValidator,
	DefaultArgsForOptionalValidator,
	GenericMutationCtx,
	GenericQueryCtx,
} from "convex/server"
import type { PropertyValidators, Validator } from "convex/values"

// export const withUser = <Ctx extends QueryCtx, Args extends [any] | [], Output>(
// 	func: (ctx: Ctx & { user: User }, ...args: Args) => Promise<Output>,
// ): ((ctx: Ctx, ...args: Args) => Promise<Output>) => {
// 	return async (ctx: Ctx, ...args: Args) => {
// 		const identity = await ctx.auth.getUserIdentity()
// 		if (!identity) {
// 			throw new Error("Unauthenticated call to function requiring authentication")
// 		}

// 		const user = await User.fromIdentity(ctx, identity)

// 		return func({ ...ctx, user }, ...args)
// 	}
// }

export const withUser = <
	TContext extends GenericQueryCtx<any> | GenericMutationCtx<any>,
	TArgs extends PropertyValidators | Validator<any, "required", any> | void,
	TResult,
	TOneOrZeroArgs extends ArgsArrayForOptionalValidator<TArgs> = DefaultArgsForOptionalValidator<TArgs>,
>({
	args,
	handler,
}: {
	args: TArgs
	handler: (ctx: TContext & { user: User }, ...args: TOneOrZeroArgs) => Promise<TResult>
}) => {
	return async (ctx: TContext, ...args: TOneOrZeroArgs): Promise<TResult> => {
		const identity = await ctx.auth.getUserIdentity()
		if (identity === null) {
			throw new Error("Not authenticated")
		}

		const user = await User.fromIdentity(ctx, identity)

		return await handler({ ...ctx, user }, ...args)
	}
}
