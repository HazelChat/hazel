import { HttpApiBuilder, HttpServerRequest, HttpServerResponse } from "@effect/platform"
import { BotRepo } from "@hazel/backend-core"
import { UnauthorizedError } from "@hazel/domain"
import { Effect, Option } from "effect"
import { HazelApi } from "../api"
import { BotGatewayService } from "../services/bot-gateway-service"

async function hashToken(token: string): Promise<string> {
	const encoder = new TextEncoder()
	const data = encoder.encode(token)
	const hashBuffer = await crypto.subtle.digest("SHA-256", data)
	const hashArray = Array.from(new Uint8Array(hashBuffer))
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

const validateBotToken = Effect.gen(function* () {
	const request = yield* HttpServerRequest.HttpServerRequest
	const authHeader = request.headers.authorization

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return yield* Effect.fail(
			new UnauthorizedError({
				message: "Missing or invalid bot token",
				detail: "Authorization header must be 'Bearer <token>'",
			}),
		)
	}

	const tokenHash = yield* Effect.promise(() => hashToken(authHeader.slice(7)))
	const botRepo = yield* BotRepo
	const botOption = yield* botRepo.findByTokenHash(tokenHash)

	if (Option.isNone(botOption)) {
		return yield* Effect.fail(
			new UnauthorizedError({
				message: "Invalid bot token",
				detail: "No bot found with this token",
			}),
		)
	}

	return botOption.value
})

export const HttpBotGatewayLive = HttpApiBuilder.group(HazelApi, "bot-gateway", (handlers) =>
	handlers.handle("streamGateway", () =>
		Effect.gen(function* () {
			const bot = yield* validateBotToken
			const request = yield* HttpServerRequest.HttpServerRequest
			const gateway = yield* BotGatewayService
			const url = new URL(request.url, "http://localhost")
			const upstream = yield* gateway.proxyRead(bot.id, url.searchParams)
			const body = yield* Effect.promise(() => upstream.text())

			const headers = Object.fromEntries(upstream.headers.entries())
			return HttpServerResponse.text(body, {
				status: upstream.status,
				headers,
			})
		}).pipe(
			Effect.catchTag("DatabaseError", () =>
				Effect.fail(
					new UnauthorizedError({
						message: "Failed to validate bot token",
						detail: "Database error",
					}),
				),
			),
			Effect.catchTag("DurableStreamRequestError", (error) =>
				HttpServerResponse.text("Bot gateway unavailable", {
					status: 503,
					headers: {
						"x-hazel-error": error.message,
					},
				}),
			),
		),
	),
)
