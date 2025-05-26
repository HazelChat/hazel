import {
	type GetNextPageParamFunction,
	type GetPreviousPageParamFunction,
	type InfiniteData,
	type QueryFunction,
	type QueryFunctionContext,
	type UseInfiniteQueryOptions,
	type UseInfiniteQueryResult,
	type UseMutationOptions,
	type UseMutationResult,
	type UseQueryOptions,
	type UseQueryResult,
	skipToken,
	useInfiniteQuery,
	useMutation,
	useQuery,
} from "@tanstack/solid-query"
import * as Cause from "effect/Cause"
import * as Data from "effect/Data"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import * as Predicate from "effect/Predicate"
import { type Accessor, createMemo } from "solid-js"
import { toaster } from "~/components/ui/toaster"
import type { LiveRuntimeContext } from "../services/live-layer"
import { useRuntime } from "../services/runtime"

export class QueryDefect extends Data.TaggedError("QueryDefect")<{
	cause: unknown
}> {}

const hasStringMessage = Predicate.compose(
	Predicate.isRecord,
	Predicate.compose(Predicate.hasProperty("message"), Predicate.struct({ message: Predicate.isString })),
)

type EffectfulError<Tag extends string = string> = { _tag: Tag }
type ToastifyErrorsConfig<E extends EffectfulError> = {
	[K in E["_tag"]]?: (error: Extract<E, EffectfulError<K>>) => string
} & {
	orElse?: boolean | string | "extractMessage"
}

type UseRunnerOpts<A, E extends EffectfulError> = {
	toastifyDefects?: boolean | string
	toastifyErrors?: ToastifyErrorsConfig<E>
	toastifySuccess?: (result: A) => string
}

const DEFAULT_ERROR_MESSAGE = "Something went wrong"
const DEFAULT_DEFECT_MESSAGE = "An unexpected error occurred"

const useRunner = <A, E extends EffectfulError, R extends LiveRuntimeContext>({
	toastifyDefects = true,
	toastifyErrors = {},
	toastifySuccess,
}: UseRunnerOpts<NoInfer<A>, NoInfer<E>> = {}): ((span: string) => (self: Effect.Effect<A, E, R>) => Promise<A>) => {
	const runtime = useRuntime()

	return (span: string) =>
		(self: Effect.Effect<A, E, R>): Promise<A> => {
			const { orElse = true, ...tagConfigs } = toastifyErrors

			return self
				.pipe(
					Effect.tapError((error) =>
						Effect.sync(() => {
							const errorTag = error._tag as keyof typeof tagConfigs
							const tagHandler = tagConfigs[errorTag]

							if (tagHandler !== undefined) {
								const message = tagHandler(error as any)
								toaster.error({
									title: message,
								})
								return
							}
							if (orElse !== false) {
								if (orElse === "extractMessage" && hasStringMessage(error)) {
									toaster.error({ title: error.message })
								} else if (typeof orElse === "string") {
									toaster.error({ title: orElse })
								} else {
									toaster.error({ title: DEFAULT_ERROR_MESSAGE })
								}
							}
						}),
					),
					Effect.tap((result) => {
						if (toastifySuccess !== undefined) {
							toaster.success({ title: toastifySuccess(result) })
						}
					}),
					Effect.tapErrorCause(Effect.logError),
					Effect.withSpan(span),
					runtime.runPromiseExit,
				)
				.then(
					Exit.match({
						onSuccess: (value) => Promise.resolve(value),
						onFailure: (cause) => {
							if (Cause.isFailType(cause)) {
								throw cause.error satisfies E
							}

							if (toastifyDefects !== false) {
								const defectMessage =
									typeof toastifyDefects === "string" ? toastifyDefects : DEFAULT_DEFECT_MESSAGE
								toaster.error({ title: defectMessage })
							}

							throw new QueryDefect({ cause: Cause.squash(cause) })
						},
					}),
				)
		}
}

export type QueryVariables = Record<string, unknown>
export type QueryKey = readonly [string, QueryVariables?]

type EffectfulMutationOptions<A, E extends EffectfulError, Variables, R extends LiveRuntimeContext> = Omit<
	UseMutationOptions<A, E | QueryDefect, Variables>,
	"mutationFn" | "onSuccess" | "onError" | "onSettled" | "retry" | "retryDelay"
> & {
	mutationKey: QueryKey
	mutationFn: (variables: Variables) => Effect.Effect<A, E, R>
} & UseRunnerOpts<A, E>

export function useEffectMutation<A, E extends EffectfulError, Variables, R extends LiveRuntimeContext>(
	options: EffectfulMutationOptions<A, E, Variables, R> | Accessor<EffectfulMutationOptions<A, E, Variables, R>>,
): UseMutationResult<A, E | QueryDefect, Variables> {
	const resolvedOptions = createMemo(() => (typeof options === "function" ? options() : options))

	const effectRunner = createMemo(() => useRunner<A, E, R>(resolvedOptions()))

	const mutationOptions = createMemo(() => {
		const opts = resolvedOptions()
		const runner = effectRunner()
		const [spanName] = opts.mutationKey

		const mutationFn = (variables: Variables) => {
			const effect = opts.mutationFn(variables)
			return effect.pipe(runner(spanName))
		}

		return {
			...opts,
			mutationFn,
			throwOnError: false,
		}
	})

	return useMutation<A, E | QueryDefect, Variables>(mutationOptions)
}

type EffectfulQueryFunction<
	A,
	E extends EffectfulError,
	R extends LiveRuntimeContext,
	QueryKeyType extends QueryKey = QueryKey,
	PageParam = never,
> = (context: QueryFunctionContext<QueryKeyType, PageParam>) => Effect.Effect<A, E, R>

type EffectfulQueryOptions<
	A,
	E extends EffectfulError,
	R extends LiveRuntimeContext,
	QueryKeyType extends QueryKey = QueryKey,
	PageParam = never,
> = Omit<
	UseQueryOptions<A, E | QueryDefect, A, QueryKeyType>,
	"queryKey" | "queryFn" | "retry" | "retryDelay" | "staleTime" | "gcTime"
> & {
	queryKey: QueryKeyType
	queryFn: EffectfulQueryFunction<A, E, R, QueryKeyType, PageParam> | typeof skipToken
	staleTime?: Duration.DurationInput
	gcTime?: Duration.DurationInput
} & UseRunnerOpts<A, E>

export function useEffectQuery<
	A,
	E extends EffectfulError,
	R extends LiveRuntimeContext,
	QueryKeyType extends QueryKey = QueryKey,
>(options: Accessor<EffectfulQueryOptions<A, E, R, QueryKeyType>>): UseQueryResult<A, E | QueryDefect> {
	const effectRunner = createMemo(() => useRunner<A, E, R>(options()))

	const queryOptions = createMemo(() => {
		const opts = options()
		const runner = effectRunner()
		const { gcTime, staleTime, ...restOpts } = opts
		const [spanName] = opts.queryKey

		const queryFn: QueryFunction<A, QueryKeyType> = (context: QueryFunctionContext<QueryKeyType>) => {
			const effect = (opts.queryFn as EffectfulQueryFunction<A, E, R, QueryKeyType>)(context)
			return effect.pipe(runner(spanName))
		}

		return {
			...restOpts,
			queryFn: opts.queryFn === skipToken ? skipToken : (queryFn as any),
			...(staleTime !== undefined && {
				staleTime: Duration.toMillis(staleTime),
			}),
			...(gcTime !== undefined && { gcTime: Duration.toMillis(gcTime) }),
			throwOnError: false,
		}
	})

	return useQuery<A, E | QueryDefect, A, QueryKeyType>(queryOptions)
}

export type UseQueryResultSuccess<TData> = UseQueryResult<TData, unknown>["data"]

export type EffectfulInfiniteQueryOptions<
	A,
	E extends EffectfulError,
	R extends LiveRuntimeContext,
	QueryKeyType extends QueryKey = QueryKey,
	PageParam = unknown,
> = Omit<
	UseInfiniteQueryOptions<A, E | QueryDefect, InfiniteData<A, PageParam>, QueryKeyType>,
	"queryFn" | "retry" | "retryDelay" | "staleTime" | "gcTime"
> & {
	queryKey: QueryKeyType
	queryFn: EffectfulQueryFunction<A, E, R, QueryKeyType, PageParam> | typeof skipToken
	getNextPageParam: GetNextPageParamFunction<PageParam, A>
	getPreviousPageParam?: GetPreviousPageParamFunction<PageParam, A>
	initialPageParam: PageParam
	staleTime?: Duration.DurationInput
	gcTime?: Duration.DurationInput
} & UseRunnerOpts<A, E>

export function useEffectInfiniteQuery<
	A,
	E extends EffectfulError,
	R extends LiveRuntimeContext,
	QueryKeyType extends QueryKey = QueryKey,
	PageParam = unknown,
>(
	options: Accessor<EffectfulInfiniteQueryOptions<A, E, R, QueryKeyType, PageParam>>,
): UseInfiniteQueryResult<InfiniteData<A, PageParam>, E | QueryDefect> {
	const effectRunner = createMemo(() => useRunner<A, E, R>(options()))

	const infiniteQueryOptions = createMemo(() => {
		const opts = options()
		const runner = effectRunner()
		const {
			gcTime,
			getNextPageParam,
			getPreviousPageParam,
			initialPageParam,
			queryFn: effectfulQueryFn,
			queryKey,
			staleTime,
			...restOpts
		} = opts
		const [spanName] = queryKey

		const queryFn: QueryFunction<A, QueryKeyType, PageParam> = (
			context: QueryFunctionContext<QueryKeyType, PageParam>,
		) => {
			const effect = (effectfulQueryFn as EffectfulQueryFunction<A, E, R, QueryKeyType, PageParam>)(context)
			return effect.pipe(runner(spanName))
		}

		return {
			...restOpts,
			queryKey,
			queryFn: effectfulQueryFn === skipToken ? skipToken : (queryFn as any),
			initialPageParam,
			getNextPageParam,
			...(getPreviousPageParam !== undefined && { getPreviousPageParam }),
			...(staleTime !== undefined && {
				staleTime: Duration.toMillis(staleTime),
			}),
			...(gcTime !== undefined && { gcTime: Duration.toMillis(gcTime) }),
			throwOnError: false,
		}
	})

	return useInfiniteQuery<A, E | QueryDefect, InfiniteData<A, PageParam>, QueryKeyType, PageParam>(
		infiniteQueryOptions,
	)
}
