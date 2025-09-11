import { HttpApiBuilder } from "@effect/platform"
import { Database } from "@hazel/db"
import { OrganizationId } from "@hazel/db/schema"
import { Effect } from "effect"
import { HazelApi } from "../api"
import { CurrentUser } from "../lib/auth"
import { generateTransactionId } from "../lib/create-transactionId"
import { InternalServerError } from "../lib/errors"
import { MockDataGenerator } from "../services/mock-data-generator"

export const HttpMockDataLive = HttpApiBuilder.group(HazelApi, "mockData", (handlers) =>
	Effect.gen(function* () {
		const db = yield* Database.Database
		const mockDataService = yield* MockDataGenerator

		return handlers.handle(
			"generate",
			Effect.fn(function* ({ payload }) {
				yield* CurrentUser

				const { result, txid } = yield* db
					.transaction(
						Effect.fnUntraced(function* (tx) {
							const result = yield* mockDataService.generateForOrganization(
								OrganizationId.make(payload.organizationId),
								{
									userCount: payload.userCount,
									channelCount: payload.channelCount,
									messageCount: payload.messageCount,
								},
							)

							const txid = yield* generateTransactionId(tx)

							return { result, txid }
						}),
					)
					.pipe(
						Effect.catchTags({
							DatabaseError: (err) =>
								new InternalServerError({
									message: "Failed to generate mock data",
									cause: err,
								}),
							ParseError: (err) =>
								new InternalServerError({
									message: "Invalid data format",
									cause: err,
								}),
						}),
					)

				return {
					transactionId: txid,
					created: result.summary,
				}
			}),
		)
	}),
)
