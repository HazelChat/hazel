import type { InfiniteData } from "@tanstack/solid-query"
import * as Effect from "effect/Effect"
import * as mutative from "mutative"
import { QueryClient } from "../services/common/query-client"
import type { QueryVariables } from "./effect-query"

export type QueryDataUpdater<TData> = (draft: mutative.Draft<TData>) => void

type QueryKey<Key extends string, Variables extends QueryVariables | void = void> = Variables extends void
	? readonly [Key]
	: readonly [Key, Variables]

/**
 * Creates a type-safe query key factory that can be used with or without variables
 * @template TKey The string literal type for the query key
 * @template TVariables Optional variables type. If not provided, the factory will not accept variables
 * @param key The query key string
 * @returns A function that creates a query key tuple
 *
 * @example Without variables:
 * ```typescript
 * const userKey = makeQueryKey("user");
 * const key = userKey(); // returns ["user"]
 * ```
 *
 * @example With variables:
 * ```typescript
 * type UserVars = { id: string };
 * const userKey = makeQueryKey<"user", UserVars>("user");
 * const key = userKey({ id: "123" }); // returns ["user", { id: "123" }]
 * ```
 */
export function makeQueryKey<Key extends string, Variables extends QueryVariables | void = void>(key: Key) {
	return ((variables?: Variables) =>
		variables === undefined ? ([key] as const) : ([key, variables] as const)) as Variables extends void
		? () => QueryKey<Key>
		: (variables: Variables) => QueryKey<Key, Variables>
}

/**
 * Creates a set of helpers to manage query data in the cache
 * @template TData The type of data stored in the query
 * @template TVariables Automatically inferred from the queryKey function parameter
 * @param queryKey A function that creates a query key tuple from variables
 * @returns An object with methods to remove, update, invalidate, and invalidate all query data
 *
 * @example Without variables:
 * ```typescript
 * const userKey = createQueryKey("user");
 * type User = { name: string };
 *
 * // Types are inferred from userKey
 * const helpers = makeHelpers<User>(userKey);
 * helpers.setData((draft) => {
 *   draft.name = "New Name";
 * });
 * ```
 *
 * @example With variables and explicit types:
 * ```typescript
 * type UserVars = { id: string };
 * type User = { id: string; name: string };
 *
 * const userKey = createQueryKey<"user", UserVars>("user");
 * const helpers = makeHelpers<User, UserVars>(userKey);
 *
 * helpers.setData({ id: "123" }, (draft) => {
 *   draft.name = "New Name";
 * });
 *
 * // Other helper methods
 * helpers.invalidateQuery({ id: "123" })
 * helpers.refetchQuery({ id: "123" })
 * helpers.removeQuery({ id: "123" })
 * ```
 */
export function makeHelpers<Data, Variables = void>(
	queryKey: Variables extends void
		? () => readonly [string]
		: (variables: Variables) => readonly [string, ...Array<unknown>],
) {
	const namespaceKey = (queryKey as () => readonly [string])()[0]

	type SetDataParams = Variables extends void
		? [(draft: mutative.Draft<Data>) => Data | void]
		: [Variables, (draft: mutative.Draft<Data>) => Data | void]

	type SetInfiniteDataParams = Variables extends void
		? [(draft: mutative.Draft<InfiniteData<Data>>) => InfiniteData<Data> | void]
		: [Variables, (draft: mutative.Draft<InfiniteData<Data>>) => InfiniteData<Data> | void]

	type QueryParams = Variables extends void ? [] : [Variables]

	return {
		getData: (...variables: QueryParams) =>
			Effect.andThen(QueryClient, (client) =>
				client.getQueryData<Data>(
					variables.length === 0
						? (queryKey as () => readonly [string])()
						: (queryKey as (v: Variables) => readonly [string, ...Array<unknown>])(variables[0]),
				),
			),
		removeQuery: (...variables: QueryParams) =>
			Effect.andThen(QueryClient, (client) => {
				client.removeQueries({
					queryKey:
						variables.length === 0
							? (queryKey as () => readonly [string])()
							: (queryKey as (v: Variables) => readonly [string, ...Array<unknown>])(variables[0]),
				})
			}),
		removeAllQueries: () =>
			Effect.andThen(QueryClient, (client) => {
				client.removeQueries({ queryKey: [namespaceKey], exact: false })
			}),
		setData: (...params: SetDataParams) =>
			Effect.andThen(QueryClient, (client) =>
				client.setQueryData<Data>(
					params.length === 1
						? (queryKey as () => readonly [string])()
						: (queryKey as (v: Variables) => readonly [string, ...Array<unknown>])(params[0]),
					(oldData) => {
						if (oldData === undefined) return oldData
						return mutative.create(
							oldData,
							(data) => {
								const updater = params.length === 1 ? params[0] : params[1]
								const result = updater(data)
								if (result !== undefined) {
									return result
								}
							},
							{},
						) as Data
					},
				),
			),
		setInfiniteData: (...params: SetInfiniteDataParams) =>
			Effect.andThen(QueryClient, (client) =>
				client.setQueryData<InfiniteData<Data>>(
					params.length === 1
						? (queryKey as () => readonly [string])()
						: (queryKey as (v: Variables) => readonly [string, ...Array<unknown>])(params[0]),
					(oldData) => {
						if (oldData === undefined) return oldData
						return mutative.create(
							oldData,
							(data) => {
								const updater = params.length === 1 ? params[0] : params[1]
								const result = updater(data)
								if (result !== undefined) {
									return result
								}
							},
							{},
						) as InfiniteData<Data>
					},
				),
			),
		invalidateQuery: (...variables: QueryParams) =>
			Effect.andThen(QueryClient, (client) =>
				client.invalidateQueries({
					queryKey:
						variables.length === 0
							? (queryKey as () => readonly [string])()
							: (queryKey as (v: Variables) => readonly [string, ...Array<unknown>])(variables[0]),
				}),
			).pipe(Effect.orDie),
		invalidateAllQueries: () =>
			Effect.andThen(QueryClient, (client) =>
				client.invalidateQueries({ queryKey: [namespaceKey], exact: false }),
			).pipe(Effect.orDie),
		refetchQuery: (...variables: QueryParams) =>
			Effect.andThen(QueryClient, (client) =>
				client.refetchQueries({
					queryKey:
						variables.length === 0
							? (queryKey as () => readonly [string])()
							: (queryKey as (v: Variables) => readonly [string, ...Array<unknown>])(variables[0]),
				}),
			).pipe(Effect.orDie),
		refetchAllQueries: () =>
			Effect.andThen(QueryClient, (client) =>
				client.refetchQueries({ queryKey: [namespaceKey], exact: false }),
			).pipe(Effect.orDie),
	}
}
