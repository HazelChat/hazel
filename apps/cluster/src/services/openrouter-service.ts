import { OpenRouterClient, OpenRouterLanguageModel } from "@effect/ai-openrouter"
import { FetchHttpClient } from "@effect/platform"
import { Config, Layer } from "effect"

// OpenRouter configuration from environment
const OpenRouterClientLayer = OpenRouterClient.layerConfig({
	apiKey: Config.redacted("OPENROUTER_API_KEY"),
	referrer: Config.string("APP_URL").pipe(Config.withDefault("https://app.hazel.sh")),
	title: Config.string("APP_NAME").pipe(Config.withDefault("Hazel")),
}).pipe(Layer.provide(FetchHttpClient.layer))

// Language model layer using a cost-effective model
// Options: openai/gpt-4o-mini, anthropic/claude-3-haiku, meta-llama/llama-3.2-3b-instruct
const MODEL = "google/gemini-3-flash-preview"

export const OpenRouterLanguageModelLayer = OpenRouterLanguageModel.layer({
	model: MODEL,
	config: {
		max_tokens: 50, // Thread names should be short
		temperature: 0.3, // Lower temperature for more consistent results
	},
}).pipe(Layer.provide(OpenRouterClientLayer))
