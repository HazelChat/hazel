import { OpenRouterClient, OpenRouterLanguageModel } from "@hazel/ai-openrouter"
import { FetchHttpClient } from "effect/unstable/http"
import { Config, Layer } from "effect"

// OpenRouter configuration from environment
const OpenRouterClientLayer = OpenRouterClient.layerConfig({
	apiKey: Config.redacted("OPENROUTER_API_KEY"),
	referrer: Config.string("APP_URL").pipe(Config.withDefault("https://app.hazel.sh")),
	title: Config.string("APP_NAME").pipe(Config.withDefault("Hazel")),
}).pipe(Layer.provide(FetchHttpClient.layer))

const MODEL = "anthropic/claude-3.5-haiku"

export const OpenRouterLanguageModelLayer = OpenRouterLanguageModel.layer({
	model: MODEL,
	config: {
		max_tokens: 200,
		temperature: 0.3,
	},
}).pipe(Layer.provide(OpenRouterClientLayer))
