import { HttpApiBuilder } from "@effect/platform"
import { Database } from "@hazel/db"
import { Effect } from "effect"
import { HazelApi } from "../api"
import { CurrentUser } from "../lib/auth"
import { generateTransactionId } from "../lib/create-transactionId"
import { InternalServerError } from "../lib/errors"
import { NotificationRepo } from "../repositories/notification-repo"

export const HttpNotificationLive = HttpApiBuilder.group(HazelApi, "notifications", (handlers) =>
	Effect.gen(function* () {
		const db = yield* Database.Database

		return handlers
			.handle(
				"create",
				Effect.fn(function* ({ payload }) {
					const _user = yield* CurrentUser

					const { createdNotification, txid } = yield* db
						.transaction(
							Effect.fnUntraced(function* (tx) {
								const createdNotification = yield* NotificationRepo.insert({
									...payload,
								}).pipe(Effect.map((res) => res[0]!))

								const txid = yield* generateTransactionId(tx)

								return { createdNotification, txid }
							}),
						)
						.pipe(
							Effect.catchTags({
								DatabaseError: (err) =>
									new InternalServerError({
										message: "Error Creating Notification",
										cause: err,
									}),
								ParseError: (err) =>
									new InternalServerError({
										message: "Error Parsing Response Schema",
										cause: err,
									}),
							}),
						)

					return {
						data: createdNotification,
						transactionId: txid,
					}
				}),
			)
			.handle(
				"update",
				Effect.fn(function* ({ payload, path }) {
					const { updatedNotification, txid } = yield* db
						.transaction(
							Effect.fnUntraced(function* (tx) {
								const updatedNotification = yield* NotificationRepo.update({
									id: path.id,
									...payload,
								})

								const txid = yield* generateTransactionId(tx)

								return { updatedNotification, txid }
							}),
						)
						.pipe(
							Effect.catchTags({
								DatabaseError: (err) =>
									new InternalServerError({
										message: "Error Updating Notification",
										cause: err,
									}),
								ParseError: (err) =>
									new InternalServerError({
										message: "Error Parsing Response Schema",
										cause: err,
									}),
							}),
						)

					return {
						data: updatedNotification,
						transactionId: txid,
					}
				}),
			)
			.handle(
				"delete",
				Effect.fn(function* ({ path }) {
					const { txid } = yield* db
						.transaction(
							Effect.fnUntraced(function* (tx) {
								yield* NotificationRepo.deleteById(path.id)

								const txid = yield* generateTransactionId(tx)

								return { txid }
							}),
						)
						.pipe(
							Effect.catchTags({
								DatabaseError: (err) =>
									new InternalServerError({
										message: "Error Deleting Notification",
										cause: err,
									}),
							}),
						)

					return {
						transactionId: txid,
					}
				}),
			)
	}),
)
