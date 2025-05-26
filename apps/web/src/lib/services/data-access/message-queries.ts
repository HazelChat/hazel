import { type ChannelId, Message, MessageId, OptimisticId } from "@maki-chat/api-schema/schema/message.js"
import { keepPreviousData } from "@tanstack/solid-query"
import { DateTime, Effect, Option, Ref, Schema } from "effect"
import type { Accessor } from "solid-js"
import { unwrap } from "solid-js/store"
import { QueryData, useEffectInfiniteQuery, useEffectMutation, useEffectQuery } from "~/lib/tanstack"
import { ApiClient } from "../common/api-client"
import { QueryClient } from "../common/query-client"

export namespace MessageQueries {
	type InfiniteVars = {
		channelId: ChannelId
	}
	const messagesKey = QueryData.makeQueryKey<"messages", InfiniteVars>("messages")
	const messagesHelpers = QueryData.makeHelpers<
		{
			data: Array<Message>
		},
		InfiniteVars
	>(messagesKey)

	const pendingOptimisticIds = Ref.unsafeMake(new Set<string>())

	export const createPaginatedMessagesQuery = ({
		channelId,
		limit = 20,
	}: { channelId: Accessor<ChannelId>; limit?: number }) => {
		return useEffectInfiniteQuery(() => ({
			queryKey: messagesKey({
				channelId: channelId(),
			}),

			queryFn: ({ pageParam }) =>
				ApiClient.use(({ client }) =>
					client.message.getMessages({
						path: {
							channelId: channelId(),
						},
						urlParams: {
							limit: limit,
							cursor: pageParam as MessageId | undefined,
						},
					}),
				),

			getNextPageParam: (lastPage) => (lastPage.pagination.hasNext ? lastPage.pagination.nextCursor : undefined),
			getPreviousPageParam: (firstPage) =>
				firstPage.pagination.hasPrevious ? firstPage.pagination.previousCursor : undefined,
			initialPageParam: undefined as string | undefined,
			placeholderData: keepPreviousData,
		}))
	}

	export const createMessageMutation = (channelId: Accessor<ChannelId>) => {
		return useEffectMutation({
			mutationKey: [
				"MessageQueries.createMessage",
				{
					channelId: channelId(),
				},
			],

			mutationFn: Effect.fnUntraced(function* (message: typeof Message.jsonCreate.Type) {
				const { client } = yield* ApiClient

				const optimisticId = OptimisticId.make(crypto.randomUUID())

				yield* Ref.update(pendingOptimisticIds, (set) => set.add(optimisticId))
				yield* Effect.addFinalizer(() =>
					Ref.update(pendingOptimisticIds, (set) => {
						set.delete(optimisticId)
						return set
					}),
				)

				const now = yield* DateTime.now

				const optimisticMessage = Message.make({
					...message,
					channelId: channelId(),
					id: MessageId.make(`temp_${crypto.randomUUID()}`),
					optimisticId: Option.some(optimisticId),
					createdAt: now,
					updatedAt: now,
				})

				yield* messagesHelpers.setInfiniteData({ channelId: channelId() }, (draft) => {
					if (draft.pages.length > 0) {
						draft.pages[0].data.unshift(optimisticMessage as any)
					}
				})

				return yield* client.message
					.createMessage({
						payload: { ...message, optimisticId: Option.some(optimisticId) },
						path: {
							channelId: channelId(),
						},
					})
					.pipe(
						Effect.tap((serverMessage) =>
							messagesHelpers.setInfiniteData({ channelId: channelId() }, (draft) => {
								for (let pageIndex = 0; pageIndex < draft.pages.length; pageIndex++) {
									const page = draft.pages[pageIndex]
									if (page.data) {
										const messageIndex = page.data.findIndex((msg) => {
											const msgOptId = Option.getOrNull(msg.optimisticId)
											const targetOptId = Option.getOrNull(serverMessage.optimisticId)
											return msgOptId === targetOptId && msgOptId !== null
										})

										if (messageIndex !== -1) {
											page.data[messageIndex] = serverMessage as any
											return
										}
									}
								}
							}),
						),
						Effect.tapError(() =>
							messagesHelpers.setInfiniteData({ channelId: channelId() }, (draft) => {
								for (let pageIndex = 0; pageIndex < draft.pages.length; pageIndex++) {
									const page = draft.pages[pageIndex]
									if (page.data) {
										const messageIndex = page.data.findIndex((msg) => {
											const msgOptId = Option.getOrNull(msg.optimisticId)
											return msgOptId === optimisticId
										})
										if (messageIndex !== -1) {
											page.data.splice(messageIndex, 1)
											return
										}
									}
								}
							}),
						),
					)
			}, Effect.scoped),
		})
	}

	export const deleteMutation = (channelId: Accessor<ChannelId>) => {
		return useEffectMutation({
			mutationKey: [
				"MessageQueries.deleteMessage",
				{
					channelId: channelId(),
				},
			],

			mutationFn: Effect.fnUntraced(function* (messageId: MessageId) {
				const { client } = yield* ApiClient

				return yield* client.message
					.deleteMessage({
						path: {
							channelId: channelId(),
							id: messageId,
						},
					})
					.pipe(
						Effect.tap(() =>
							messagesHelpers.setInfiniteData({ channelId: channelId() }, (draft) => {
								for (const page of draft.pages) {
									const index = page.data.findIndex((t) => t.id === messageId)
									if (index !== -1) {
										page.data.splice(index, 1)
										break
									}
								}
							}),
						),
					)
			}),
			toastifySuccess: () => "Message deleted",
		})
	}

	export const createMessageQuery = ({
		messageId,
		channelId,
	}: { messageId: Accessor<MessageId>; channelId: Accessor<ChannelId> }) => {
		return useEffectQuery(() => ({
			queryKey: [
				"MessageQueries.getMessage",
				{
					messageId: messageId(),
					channelId: channelId(),
				},
			],

			queryFn: Effect.fnUntraced(function* () {
				const { client } = yield* ApiClient

				return yield* client.message.getMessage({
					path: {
						id: messageId(),
						channelId: channelId(),
					},
				})
			}),
		}))
	}
}
