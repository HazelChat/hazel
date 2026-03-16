/**
 * @since 1.0.0
 */
import type * as HttpClient from "effect/unstable/http/HttpClient"
import * as HttpClientError from "effect/unstable/http/HttpClientError"
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest"
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as S from "effect/Schema"

export class CacheControlEphemeral extends S.Class<CacheControlEphemeral>("CacheControlEphemeral")({
	type: S.Literal("ephemeral"),
}) {}

export const OpenResponsesReasoningFormat = S.Literals(["unknown",
	"openai-responses-v1",
	"azure-openai-responses-v1",
	"xai-responses-v1",
	"anthropic-claude-v1",
	"google-gemini-v1",])

export const OpenResponsesReasoningType = S.Literal("reasoning")

export const ReasoningTextContentType = S.Literal("reasoning_text")

export class ReasoningTextContent extends S.Class<ReasoningTextContent>("ReasoningTextContent")({
	type: ReasoningTextContentType,
	text: S.String,
}) {}

export const ReasoningSummaryTextType = S.Literal("summary_text")

export class ReasoningSummaryText extends S.Class<ReasoningSummaryText>("ReasoningSummaryText")({
	type: ReasoningSummaryTextType,
	text: S.String,
}) {}

export const OpenResponsesReasoningStatusEnum = S.Literal("in_progress")

export class OpenResponsesReasoning extends S.Class<OpenResponsesReasoning>("OpenResponsesReasoning")({
	signature: S.optional(S.NullOr(S.String)),
	format: S.optional(S.NullOr(OpenResponsesReasoningFormat)),
	type: OpenResponsesReasoningType,
	id: S.String,
	content: S.optional(S.NullOr(S.Array(ReasoningTextContent))),
	summary: S.Array(ReasoningSummaryText),
	encrypted_content: S.optional(S.NullOr(S.String)),
	status: S.optional(S.NullOr(S.Union([
			OpenResponsesReasoningStatusEnum,
			OpenResponsesReasoningStatusEnum,
			OpenResponsesReasoningStatusEnum,
		]))),
}) {}

export class ReasoningDetailSummary extends S.Class<ReasoningDetailSummary>("ReasoningDetailSummary")({
	id: S.optional(S.NullOr(S.String)),
	type: S.Literal("reasoning.summary"),
	index: S.optional(S.Number),
	format: S.optional(S.NullOr(OpenResponsesReasoningFormat)),
	summary: S.String,
}) {}

export class ReasoningDetailEncrypted extends S.Class<ReasoningDetailEncrypted>("ReasoningDetailEncrypted")({
	id: S.optional(S.NullOr(S.String)),
	type: S.Literal("reasoning.encrypted"),
	index: S.optional(S.Number),
	format: S.optional(S.NullOr(OpenResponsesReasoningFormat)),
	data: S.String,
}) {}

export class ReasoningDetailText extends S.Class<ReasoningDetailText>("ReasoningDetailText")({
	id: S.optional(S.NullOr(S.String)),
	type: S.Literal("reasoning.text"),
	index: S.optional(S.Number),
	format: S.optional(S.NullOr(OpenResponsesReasoningFormat)),
	text: S.optional(S.NullOr(S.String)),
	signature: S.optional(S.NullOr(S.String)),
}) {}

export const ReasoningDetail = S.Union([ReasoningDetailSummary,
	ReasoningDetailEncrypted,
	ReasoningDetailText,])

export class FileAnnotationDetail extends S.Class<FileAnnotationDetail>("FileAnnotationDetail")({
	type: S.Literal("file"),
	file: S.Struct({
		hash: S.String,
		name: S.optional(S.NullOr(S.String)),
		content: S.Array(
			S.Union([
				S.Struct({
					type: S.Literal("text"),
					text: S.String,
				}),
				S.Struct({
					type: S.Literal("image_url"),
					image_url: S.Struct({
						url: S.String,
					}),
				}),
			]),
		),
	}),
}) {}

export class URLCitationAnnotationDetail extends S.Class<URLCitationAnnotationDetail>(
	"URLCitationAnnotationDetail",
)({
	type: S.Literal("url_citation"),
	url_citation: S.Struct({
		end_index: S.Number,
		start_index: S.Number,
		title: S.String,
		url: S.String,
		content: S.optional(S.NullOr(S.String)),
	}),
}) {}

export const AnnotationDetail = S.Union([FileAnnotationDetail, URLCitationAnnotationDetail])

export const OpenResponsesEasyInputMessageType = S.Literal("message")

export const OpenResponsesEasyInputMessageRoleEnum = S.Literal("developer")

export const ResponseInputTextType = S.Literal("input_text")

/**
 * Text input content item
 */
export class ResponseInputText extends S.Class<ResponseInputText>("ResponseInputText")({
	type: ResponseInputTextType,
	text: S.String,
}) {}

export const ResponseInputFileType = S.Literal("input_file")

/**
 * File input content item
 */
export class ResponseInputFile extends S.Class<ResponseInputFile>("ResponseInputFile")({
	type: ResponseInputFileType,
	file_id: S.optional(S.NullOr(S.String)),
	file_data: S.optional(S.NullOr(S.String)),
	filename: S.optional(S.NullOr(S.String)),
	file_url: S.optional(S.NullOr(S.String)),
}) {}

export const ResponseInputAudioType = S.Literal("input_audio")

export const ResponseInputAudioInputAudioFormat = S.Literals(["mp3", "wav"])

/**
 * Audio input content item
 */
export class ResponseInputAudio extends S.Class<ResponseInputAudio>("ResponseInputAudio")({
	type: ResponseInputAudioType,
	input_audio: S.Struct({
		data: S.String,
		format: ResponseInputAudioInputAudioFormat,
	}),
}) {}

export const ResponseInputVideoType = S.Literal("input_video")

/**
 * Video input content item
 */
export class ResponseInputVideo extends S.Class<ResponseInputVideo>("ResponseInputVideo")({
	type: ResponseInputVideoType,
	/**
	 * A base64 data URL or remote URL that resolves to a video file
	 */
	video_url: S.String,
}) {}

export class OpenResponsesEasyInputMessage extends S.Class<OpenResponsesEasyInputMessage>(
	"OpenResponsesEasyInputMessage",
)({
	type: S.optional(S.NullOr(OpenResponsesEasyInputMessageType)),
	role: S.Union([
		OpenResponsesEasyInputMessageRoleEnum,
		OpenResponsesEasyInputMessageRoleEnum,
		OpenResponsesEasyInputMessageRoleEnum,
		OpenResponsesEasyInputMessageRoleEnum,
	]),
	content: S.Union([
		S.Array(
			S.Union([
				ResponseInputText,
				/**
				 * Image input content item
				 */
				S.Struct({
					type: S.Literal("input_image"),
					detail: S.Literals(["auto", "high", "low"]),
					image_url: S.optional(S.NullOr(S.String)),
				}),
				ResponseInputFile,
				ResponseInputAudio,
				ResponseInputVideo,
			]),
		),
		S.String,
	]),
}) {}

export const OpenResponsesInputMessageItemType = S.Literal("message")

export const OpenResponsesInputMessageItemRoleEnum = S.Literal("developer")

export class OpenResponsesInputMessageItem extends S.Class<OpenResponsesInputMessageItem>(
	"OpenResponsesInputMessageItem",
)({
	id: S.optional(S.NullOr(S.String)),
	type: S.optional(S.NullOr(OpenResponsesInputMessageItemType)),
	role: S.Union([
		OpenResponsesInputMessageItemRoleEnum,
		OpenResponsesInputMessageItemRoleEnum,
		OpenResponsesInputMessageItemRoleEnum,
	]),
	content: S.Array(
		S.Union([
			ResponseInputText,
			/**
			 * Image input content item
			 */
			S.Struct({
				type: S.Literal("input_image"),
				detail: S.Literals(["auto", "high", "low"]),
				image_url: S.optional(S.NullOr(S.String)),
			}),
			ResponseInputFile,
			ResponseInputAudio,
			ResponseInputVideo,
		]),
	),
}) {}

export const OpenResponsesFunctionToolCallType = S.Literal("function_call")

export const ToolCallStatus = S.Literals(["in_progress", "completed", "incomplete"])

/**
 * A function call initiated by the model
 */
export class OpenResponsesFunctionToolCall extends S.Class<OpenResponsesFunctionToolCall>(
	"OpenResponsesFunctionToolCall",
)({
	type: OpenResponsesFunctionToolCallType,
	call_id: S.String,
	name: S.String,
	arguments: S.String,
	id: S.String,
	status: S.optional(S.NullOr(ToolCallStatus)),
}) {}

export const OpenResponsesFunctionCallOutputType = S.Literal("function_call_output")

/**
 * The output from a function call execution
 */
export class OpenResponsesFunctionCallOutput extends S.Class<OpenResponsesFunctionCallOutput>(
	"OpenResponsesFunctionCallOutput",
)({
	type: OpenResponsesFunctionCallOutputType,
	id: S.optional(S.NullOr(S.String)),
	call_id: S.String,
	output: S.String,
	status: S.optional(S.NullOr(ToolCallStatus)),
}) {}

export const ResponsesOutputMessageRole = S.Literal("assistant")

export const ResponsesOutputMessageType = S.Literal("message")

export const ResponsesOutputMessageStatusEnum = S.Literal("in_progress")

export const ResponseOutputTextType = S.Literal("output_text")

export const FileCitationType = S.Literal("file_citation")

export class FileCitation extends S.Class<FileCitation>("FileCitation")({
	type: FileCitationType,
	file_id: S.String,
	filename: S.String,
	index: S.Number,
}) {}

export const URLCitationType = S.Literal("url_citation")

export class URLCitation extends S.Class<URLCitation>("URLCitation")({
	type: URLCitationType,
	url: S.String,
	title: S.String,
	start_index: S.Number,
	end_index: S.Number,
}) {}

export const FilePathType = S.Literal("file_path")

export class FilePath extends S.Class<FilePath>("FilePath")({
	type: FilePathType,
	file_id: S.String,
	index: S.Number,
}) {}

export const OpenAIResponsesAnnotation = S.Union([FileCitation, URLCitation, FilePath])

export class ResponseOutputText extends S.Class<ResponseOutputText>("ResponseOutputText")({
	type: ResponseOutputTextType,
	text: S.String,
	annotations: S.optional(S.NullOr(S.Array(OpenAIResponsesAnnotation))),
	logprobs: S.optional(S.NullOr(S.Array(
			S.Struct({
				token: S.String,
				bytes: S.Array(S.Number),
				logprob: S.Number,
				top_logprobs: S.Array(
					S.Struct({
						token: S.String,
						bytes: S.Array(S.Number),
						logprob: S.Number,
					}),
				),
			}),
		))),
}) {}

export const OpenAIResponsesRefusalContentType = S.Literal("refusal")

export class OpenAIResponsesRefusalContent extends S.Class<OpenAIResponsesRefusalContent>(
	"OpenAIResponsesRefusalContent",
)({
	type: OpenAIResponsesRefusalContentType,
	refusal: S.String,
}) {}

export class ResponsesOutputMessage extends S.Class<ResponsesOutputMessage>("ResponsesOutputMessage")({
	id: S.String,
	role: ResponsesOutputMessageRole,
	type: ResponsesOutputMessageType,
	status: S.optional(S.NullOr(S.Union([
			ResponsesOutputMessageStatusEnum,
			ResponsesOutputMessageStatusEnum,
			ResponsesOutputMessageStatusEnum,
		]))),
	content: S.Array(S.Union([ResponseOutputText, OpenAIResponsesRefusalContent])),
}) {}

/**
 * The format of the reasoning content
 */
export const ResponsesOutputItemReasoningFormat = S.Literals(["unknown",
	"openai-responses-v1",
	"azure-openai-responses-v1",
	"xai-responses-v1",
	"anthropic-claude-v1",
	"google-gemini-v1",])

export const ResponsesOutputItemReasoningType = S.Literal("reasoning")

export const ResponsesOutputItemReasoningStatusEnum = S.Literal("in_progress")

export class ResponsesOutputItemReasoning extends S.Class<ResponsesOutputItemReasoning>(
	"ResponsesOutputItemReasoning",
)({
	/**
	 * A signature for the reasoning content, used for verification
	 */
	signature: S.optional(S.NullOr(S.String)),
	/**
	 * The format of the reasoning content
	 */
	format: S.optional(S.NullOr(ResponsesOutputItemReasoningFormat)),
	type: ResponsesOutputItemReasoningType,
	id: S.String,
	content: S.optional(S.NullOr(S.Array(ReasoningTextContent))),
	summary: S.Array(ReasoningSummaryText),
	encrypted_content: S.optional(S.NullOr(S.String)),
	status: S.optional(S.NullOr(S.Union([
			ResponsesOutputItemReasoningStatusEnum,
			ResponsesOutputItemReasoningStatusEnum,
			ResponsesOutputItemReasoningStatusEnum,
		]))),
}) {}

export const ResponsesOutputItemFunctionCallType = S.Literal("function_call")

export const ResponsesOutputItemFunctionCallStatusEnum = S.Literal("in_progress")

export class ResponsesOutputItemFunctionCall extends S.Class<ResponsesOutputItemFunctionCall>(
	"ResponsesOutputItemFunctionCall",
)({
	type: ResponsesOutputItemFunctionCallType,
	id: S.optional(S.NullOr(S.String)),
	name: S.String,
	arguments: S.String,
	call_id: S.String,
	status: S.optional(S.NullOr(S.Union([
			ResponsesOutputItemFunctionCallStatusEnum,
			ResponsesOutputItemFunctionCallStatusEnum,
			ResponsesOutputItemFunctionCallStatusEnum,
		]))),
}) {}

export const ResponsesWebSearchCallOutputType = S.Literal("web_search_call")

export const WebSearchStatus = S.Literals(["completed", "searching", "in_progress", "failed"])

export class ResponsesWebSearchCallOutput extends S.Class<ResponsesWebSearchCallOutput>(
	"ResponsesWebSearchCallOutput",
)({
	type: ResponsesWebSearchCallOutputType,
	id: S.String,
	status: WebSearchStatus,
}) {}

export const ResponsesOutputItemFileSearchCallType = S.Literal("file_search_call")

export class ResponsesOutputItemFileSearchCall extends S.Class<ResponsesOutputItemFileSearchCall>(
	"ResponsesOutputItemFileSearchCall",
)({
	type: ResponsesOutputItemFileSearchCallType,
	id: S.String,
	queries: S.Array(S.String),
	status: WebSearchStatus,
}) {}

export const ResponsesImageGenerationCallType = S.Literal("image_generation_call")

export const ImageGenerationStatus = S.Literals(["in_progress", "completed", "generating", "failed"])

export class ResponsesImageGenerationCall extends S.Class<ResponsesImageGenerationCall>(
	"ResponsesImageGenerationCall",
)({
	type: ResponsesImageGenerationCallType,
	id: S.String,
	result: S.NullOr(S.String).pipe(S.optional, S.withDecodingDefault(() => null)),
	status: ImageGenerationStatus,
}) {}

/**
 * Input for a response request - can be a string or array of items
 */
export const OpenResponsesInput = S.Union([S.String,
	S.Array(
		S.Union([
			OpenResponsesReasoning,
			OpenResponsesEasyInputMessage,
			OpenResponsesInputMessageItem,
			OpenResponsesFunctionToolCall,
			OpenResponsesFunctionCallOutput,
			ResponsesOutputMessage,
			ResponsesOutputItemReasoning,
			ResponsesOutputItemFunctionCall,
			ResponsesWebSearchCallOutput,
			ResponsesOutputItemFileSearchCall,
			ResponsesImageGenerationCall,
		]),
	),])

/**
 * Metadata key-value pairs for the request. Keys must be ≤64 characters and cannot contain brackets. Values must be ≤512 characters. Maximum 16 pairs allowed.
 */
export const OpenResponsesRequestMetadata = S.Record(S.String, S.Unknown)

export const OpenResponsesWebSearchPreviewToolType = S.Literal("web_search_preview")

/**
 * Size of the search context for web search tools
 */
export const ResponsesSearchContextSize = S.Literals(["low", "medium", "high"])

export const WebSearchPreviewToolUserLocationType = S.Literal("approximate")

export class WebSearchPreviewToolUserLocation extends S.Class<WebSearchPreviewToolUserLocation>(
	"WebSearchPreviewToolUserLocation",
)({
	type: WebSearchPreviewToolUserLocationType,
	city: S.optional(S.NullOr(S.String)),
	country: S.optional(S.NullOr(S.String)),
	region: S.optional(S.NullOr(S.String)),
	timezone: S.optional(S.NullOr(S.String)),
}) {}

/**
 * Web search preview tool configuration
 */
export class OpenResponsesWebSearchPreviewTool extends S.Class<OpenResponsesWebSearchPreviewTool>(
	"OpenResponsesWebSearchPreviewTool",
)({
	type: OpenResponsesWebSearchPreviewToolType,
	search_context_size: S.optional(S.NullOr(ResponsesSearchContextSize)),
	user_location: S.optional(S.NullOr(WebSearchPreviewToolUserLocation)),
}) {}

export const OpenResponsesWebSearchPreview20250311ToolType = S.Literals(["web_search_preview_2025_03_11",])

/**
 * Web search preview tool configuration (2025-03-11 version)
 */
export class OpenResponsesWebSearchPreview20250311Tool extends S.Class<OpenResponsesWebSearchPreview20250311Tool>(
	"OpenResponsesWebSearchPreview20250311Tool",
)({
	type: OpenResponsesWebSearchPreview20250311ToolType,
	search_context_size: S.optional(S.NullOr(ResponsesSearchContextSize)),
	user_location: S.optional(S.NullOr(WebSearchPreviewToolUserLocation)),
}) {}

export const OpenResponsesWebSearchToolType = S.Literal("web_search")

export const ResponsesWebSearchUserLocationType = S.Literal("approximate")

/**
 * User location information for web search
 */
export class ResponsesWebSearchUserLocation extends S.Class<ResponsesWebSearchUserLocation>(
	"ResponsesWebSearchUserLocation",
)({
	type: S.optional(S.NullOr(ResponsesWebSearchUserLocationType)),
	city: S.optional(S.NullOr(S.String)),
	country: S.optional(S.NullOr(S.String)),
	region: S.optional(S.NullOr(S.String)),
	timezone: S.optional(S.NullOr(S.String)),
}) {}

/**
 * Web search tool configuration
 */
export class OpenResponsesWebSearchTool extends S.Class<OpenResponsesWebSearchTool>(
	"OpenResponsesWebSearchTool",
)({
	type: OpenResponsesWebSearchToolType,
	filters: S.optional(S.NullOr(S.Struct({
			allowed_domains: S.optional(S.NullOr(S.Array(S.String))),
		}))),
	search_context_size: S.optional(S.NullOr(ResponsesSearchContextSize)),
	user_location: S.optional(S.NullOr(ResponsesWebSearchUserLocation)),
}) {}

export const OpenResponsesWebSearch20250826ToolType = S.Literal("web_search_2025_08_26")

/**
 * Web search tool configuration (2025-08-26 version)
 */
export class OpenResponsesWebSearch20250826Tool extends S.Class<OpenResponsesWebSearch20250826Tool>(
	"OpenResponsesWebSearch20250826Tool",
)({
	type: OpenResponsesWebSearch20250826ToolType,
	filters: S.optional(S.NullOr(S.Struct({
			allowed_domains: S.optional(S.NullOr(S.Array(S.String))),
		}))),
	search_context_size: S.optional(S.NullOr(ResponsesSearchContextSize)),
	user_location: S.optional(S.NullOr(ResponsesWebSearchUserLocation)),
}) {}

export const OpenAIResponsesToolChoiceEnum = S.Literal("required")

export const OpenAIResponsesToolChoiceEnumType = S.Literal("function")

export const OpenAIResponsesToolChoiceEnumTypeEnum = S.Literal("web_search_preview")

export const OpenAIResponsesToolChoice = S.Union([OpenAIResponsesToolChoiceEnum,
	OpenAIResponsesToolChoiceEnum,
	OpenAIResponsesToolChoiceEnum,
	S.Struct({
		type: OpenAIResponsesToolChoiceEnumType,
		name: S.String,
	}),
	S.Struct({
		type: S.Union([OpenAIResponsesToolChoiceEnumTypeEnum, OpenAIResponsesToolChoiceEnumTypeEnum]),
	}),])

export const ResponsesFormatTextType = S.Literal("text")

/**
 * Plain text response format
 */
export class ResponsesFormatText extends S.Class<ResponsesFormatText>("ResponsesFormatText")({
	type: ResponsesFormatTextType,
}) {}

export const ResponsesFormatJSONObjectType = S.Literal("json_object")

/**
 * JSON object response format
 */
export class ResponsesFormatJSONObject extends S.Class<ResponsesFormatJSONObject>(
	"ResponsesFormatJSONObject",
)({
	type: ResponsesFormatJSONObjectType,
}) {}

export const ResponsesFormatTextJSONSchemaConfigType = S.Literal("json_schema")

/**
 * JSON schema constrained response format
 */
export class ResponsesFormatTextJSONSchemaConfig extends S.Class<ResponsesFormatTextJSONSchemaConfig>(
	"ResponsesFormatTextJSONSchemaConfig",
)({
	type: ResponsesFormatTextJSONSchemaConfigType,
	name: S.String,
	description: S.optional(S.NullOr(S.String)),
	strict: S.optional(S.NullOr(S.Boolean)),
	schema: S.Record(S.String, S.Unknown),
}) {}

/**
 * Text response format configuration
 */
export const ResponseFormatTextConfig = S.Union([ResponsesFormatText,
	ResponsesFormatJSONObject,
	ResponsesFormatTextJSONSchemaConfig,])

export const OpenResponsesResponseTextVerbosity = S.Literals(["high", "low", "medium"])

/**
 * Text output configuration including format and verbosity
 */
export class OpenResponsesResponseText extends S.Class<OpenResponsesResponseText>(
	"OpenResponsesResponseText",
)({
	format: S.optional(S.NullOr(ResponseFormatTextConfig)),
	verbosity: S.optional(S.NullOr(OpenResponsesResponseTextVerbosity)),
}) {}

export const OpenAIResponsesReasoningEffort = S.Literals(["xhigh",
	"high",
	"medium",
	"low",
	"minimal",
	"none",])

export const ReasoningSummaryVerbosity = S.Literals(["auto", "concise", "detailed"])

export class OpenResponsesReasoningConfig extends S.Class<OpenResponsesReasoningConfig>(
	"OpenResponsesReasoningConfig",
)({
	max_tokens: S.optional(S.NullOr(S.Number)),
	enabled: S.optional(S.NullOr(S.Boolean)),
	effort: S.optional(S.NullOr(OpenAIResponsesReasoningEffort)),
	summary: S.optional(S.NullOr(ReasoningSummaryVerbosity)),
}) {}

export const ResponsesOutputModality = S.Literals(["text", "image"])

export class OpenAIResponsesPrompt extends S.Class<OpenAIResponsesPrompt>("OpenAIResponsesPrompt")({
	id: S.String,
	variables: S.optional(S.NullOr(S.Record(S.String, S.Unknown))),
}) {}

export const OpenAIResponsesIncludable = S.Literals(["file_search_call.results",
	"message.input_image.image_url",
	"computer_call_output.output.image_url",
	"reasoning.encrypted_content",
	"code_interpreter_call.outputs",])

export const OpenResponsesRequestServiceTier = S.Literal("auto")

export const OpenResponsesRequestTruncationEnum = S.Literals(["auto", "disabled"])

export const OpenResponsesRequestTruncation = OpenResponsesRequestTruncationEnum

/**
 * Data collection setting. If no available model provider meets the requirement, your request will return an error.
 * - allow: (default) allow providers which store user data non-transiently and may train on it
 *
 * - deny: use only providers which do not collect user data.
 */
export const DataCollection = S.Literals(["deny", "allow"])

export const ProviderName = S.Literals(["AI21",
	"AionLabs",
	"Alibaba",
	"Amazon Bedrock",
	"Amazon Nova",
	"Anthropic",
	"Arcee AI",
	"AtlasCloud",
	"Avian",
	"Azure",
	"BaseTen",
	"BytePlus",
	"Black Forest Labs",
	"Cerebras",
	"Chutes",
	"Cirrascale",
	"Clarifai",
	"Cloudflare",
	"Cohere",
	"Crusoe",
	"DeepInfra",
	"DeepSeek",
	"Featherless",
	"Fireworks",
	"Friendli",
	"GMICloud",
	"Google",
	"Google AI Studio",
	"Groq",
	"Hyperbolic",
	"Inception",
	"Inceptron",
	"InferenceNet",
	"Infermatic",
	"Inflection",
	"Liquid",
	"Mara",
	"Mancer 2",
	"Minimax",
	"ModelRun",
	"Mistral",
	"Modular",
	"Moonshot AI",
	"Morph",
	"NCompass",
	"Nebius",
	"NextBit",
	"Novita",
	"Nvidia",
	"OpenAI",
	"OpenInference",
	"Parasail",
	"Perplexity",
	"Phala",
	"Relace",
	"SambaNova",
	"Seed",
	"SiliconFlow",
	"Sourceful",
	"Stealth",
	"StreamLake",
	"Switchpoint",
	"Together",
	"Upstage",
	"Venice",
	"WandB",
	"Xiaomi",
	"xAI",
	"Z.AI",
	"FakeProvider",])

export const Quantization = S.Literals(["int4",
	"int8",
	"fp4",
	"fp6",
	"fp8",
	"fp16",
	"bf16",
	"fp32",
	"unknown",])

export const ProviderSort = S.Literals(["price", "throughput", "latency"])

export const ProviderSortConfigPartitionEnum = S.Literals(["model", "none"])

export class ProviderSortConfig extends S.Class<ProviderSortConfig>("ProviderSortConfig")({
	by: S.optional(S.NullOr(ProviderSort)),
	partition: S.optional(S.NullOr(ProviderSortConfigPartitionEnum)),
}) {}

/**
 * A value in string format that is a large number
 */
export const BigNumberUnion = S.String

/**
 * Percentile-based throughput cutoffs. All specified cutoffs must be met for an endpoint to be preferred.
 */
export class PercentileThroughputCutoffs extends S.Class<PercentileThroughputCutoffs>(
	"PercentileThroughputCutoffs",
)({
	/**
	 * Minimum p50 throughput (tokens/sec)
	 */
	p50: S.optional(S.NullOr(S.Number)),
	/**
	 * Minimum p75 throughput (tokens/sec)
	 */
	p75: S.optional(S.NullOr(S.Number)),
	/**
	 * Minimum p90 throughput (tokens/sec)
	 */
	p90: S.optional(S.NullOr(S.Number)),
	/**
	 * Minimum p99 throughput (tokens/sec)
	 */
	p99: S.optional(S.NullOr(S.Number)),
}) {}

/**
 * Preferred minimum throughput (in tokens per second). Can be a number (applies to p50) or an object with percentile-specific cutoffs. Endpoints below the threshold(s) may still be used, but are deprioritized in routing. When using fallback models, this may cause a fallback model to be used instead of the primary model if it meets the threshold.
 */
export const PreferredMinThroughput = S.Union([S.Number, PercentileThroughputCutoffs])

/**
 * Percentile-based latency cutoffs. All specified cutoffs must be met for an endpoint to be preferred.
 */
export class PercentileLatencyCutoffs extends S.Class<PercentileLatencyCutoffs>("PercentileLatencyCutoffs")({
	/**
	 * Maximum p50 latency (seconds)
	 */
	p50: S.optional(S.NullOr(S.Number)),
	/**
	 * Maximum p75 latency (seconds)
	 */
	p75: S.optional(S.NullOr(S.Number)),
	/**
	 * Maximum p90 latency (seconds)
	 */
	p90: S.optional(S.NullOr(S.Number)),
	/**
	 * Maximum p99 latency (seconds)
	 */
	p99: S.optional(S.NullOr(S.Number)),
}) {}

/**
 * Preferred maximum latency (in seconds). Can be a number (applies to p50) or an object with percentile-specific cutoffs. Endpoints above the threshold(s) may still be used, but are deprioritized in routing. When using fallback models, this may cause a fallback model to be used instead of the primary model if it meets the threshold.
 */
export const PreferredMaxLatency = S.Union([S.Number, PercentileLatencyCutoffs])

/**
 * The search engine to use for web search.
 */
export const WebSearchEngine = S.Literals(["native", "exa"])

/**
 * The engine to use for parsing PDF files.
 */
export const PDFParserEngine = S.Literals(["mistral-ocr", "pdf-text", "native"])

/**
 * Options for PDF parsing.
 */
export class PDFParserOptions extends S.Class<PDFParserOptions>("PDFParserOptions")({
	engine: S.optional(S.NullOr(PDFParserEngine)),
}) {}

/**
 * **DEPRECATED** Use providers.sort.partition instead. Backwards-compatible alias for providers.sort.partition. Accepts legacy values: "fallback" (maps to "model"), "sort" (maps to "none").
 */
export const OpenResponsesRequestRoute = S.Literals(["fallback", "sort"])

/**
 * Request schema for Responses endpoint
 */
export class OpenResponsesRequest extends S.Class<OpenResponsesRequest>("OpenResponsesRequest")({
	input: S.optional(S.NullOr(OpenResponsesInput)),
	instructions: S.optional(S.NullOr(S.String)),
	metadata: S.optional(S.NullOr(OpenResponsesRequestMetadata)),
	tools: S.optional(S.NullOr(S.Array(
			S.Union([
				/**
				 * Function tool definition
				 */
				S.Struct({}),
				OpenResponsesWebSearchPreviewTool,
				OpenResponsesWebSearchPreview20250311Tool,
				OpenResponsesWebSearchTool,
				OpenResponsesWebSearch20250826Tool,
			]),
		))),
	tool_choice: S.optional(S.NullOr(OpenAIResponsesToolChoice)),
	parallel_tool_calls: S.optional(S.NullOr(S.Boolean)),
	model: S.optional(S.NullOr(S.String)),
	models: S.optional(S.NullOr(S.Array(S.String))),
	text: S.optional(S.NullOr(OpenResponsesResponseText)),
	reasoning: S.optional(S.NullOr(OpenResponsesReasoningConfig)),
	max_output_tokens: S.optional(S.NullOr(S.Number)),
	temperature: S.optional(S.NullOr(S.Number.check(S.isGreaterThanOrEqualTo(0), S.isLessThanOrEqualTo(2)))),
	top_p: S.optional(S.NullOr(S.Number.check(S.isGreaterThanOrEqualTo(0)))),
	top_logprobs: S.optional(S.NullOr(S.Int.check(S.isGreaterThanOrEqualTo(0), S.isLessThanOrEqualTo(20)))),
	max_tool_calls: S.optional(S.NullOr(S.Int)),
	presence_penalty: S.optional(S.NullOr(S.Number.check(S.isGreaterThanOrEqualTo(-2), S.isLessThanOrEqualTo(2)))),
	frequency_penalty: S.optional(S.NullOr(S.Number.check(S.isGreaterThanOrEqualTo(-2), S.isLessThanOrEqualTo(2)))),
	top_k: S.optional(S.NullOr(S.Number)),
	/**
	 * Provider-specific image configuration options. Keys and values vary by model/provider. See https://openrouter.ai/docs/features/multimodal/image-generation for more details.
	 */
	image_config: S.optional(S.NullOr(S.Record(S.String, S.Unknown))),
	/**
	 * Output modalities for the response. Supported values are "text" and "image".
	 */
	modalities: S.optional(S.NullOr(S.Array(ResponsesOutputModality))),
	prompt_cache_key: S.optional(S.NullOr(S.String)),
	previous_response_id: S.optional(S.NullOr(S.String)),
	prompt: S.optional(S.NullOr(OpenAIResponsesPrompt)),
	include: S.optional(S.NullOr(S.Array(OpenAIResponsesIncludable))),
	background: S.optional(S.NullOr(S.Boolean)),
	safety_identifier: S.optional(S.NullOr(S.String)),
	store: S.NullOr(S.Literal(false)).pipe(S.optional, S.withDecodingDefault(() => false as const)),
	service_tier: S.NullOr(OpenResponsesRequestServiceTier).pipe(S.optional, S.withDecodingDefault(() => "auto" as const)),
	truncation: S.optional(S.NullOr(OpenResponsesRequestTruncation)),
	stream: S.NullOr(S.Boolean).pipe(S.optional, S.withDecodingDefault(() => false as const)),
	/**
	 * When multiple model providers are available, optionally indicate your routing preference.
	 */
	provider: S.optional(S.NullOr(S.Struct({
			/**
			 * Whether to allow backup providers to serve requests
			 * - true: (default) when the primary provider (or your custom providers in "order") is unavailable, use the next best provider.
			 * - false: use only the primary/custom provider, and return the upstream error if it's unavailable.
			 */
			allow_fallbacks: S.optional(S.NullOr(S.Boolean)),
			/**
			 * Whether to filter providers to only those that support the parameters you've provided. If this setting is omitted or set to false, then providers will receive only the parameters they support, and ignore the rest.
			 */
			require_parameters: S.optional(S.NullOr(S.Boolean)),
			data_collection: S.optional(S.NullOr(DataCollection)),
			/**
			 * Whether to restrict routing to only ZDR (Zero Data Retention) endpoints. When true, only endpoints that do not retain prompts will be used.
			 */
			zdr: S.optional(S.NullOr(S.Boolean)),
			/**
			 * Whether to restrict routing to only models that allow text distillation. When true, only models where the author has allowed distillation will be used.
			 */
			enforce_distillable_text: S.optional(S.NullOr(S.Boolean)),
			/**
			 * An ordered list of provider slugs. The router will attempt to use the first provider in the subset of this list that supports your requested model, and fall back to the next if it is unavailable. If no providers are available, the request will fail with an error message.
			 */
			order: S.optional(S.NullOr(S.Array(S.Union([ProviderName, S.String])))),
			/**
			 * List of provider slugs to allow. If provided, this list is merged with your account-wide allowed provider settings for this request.
			 */
			only: S.optional(S.NullOr(S.Array(S.Union([ProviderName, S.String])))),
			/**
			 * List of provider slugs to ignore. If provided, this list is merged with your account-wide ignored provider settings for this request.
			 */
			ignore: S.optional(S.NullOr(S.Array(S.Union([ProviderName, S.String])))),
			/**
			 * A list of quantization levels to filter the provider by.
			 */
			quantizations: S.optional(S.NullOr(S.Array(Quantization))),
			/**
			 * The sorting strategy to use for this request, if "order" is not specified. When set, no load balancing is performed.
			 */
			sort: S.optional(S.NullOr(S.Union([ProviderSort, ProviderSortConfig]))),
			/**
			 * The object specifying the maximum price you want to pay for this request. USD price per million tokens, for prompt and completion.
			 */
			max_price: S.optional(S.Struct({
					prompt: S.optional(S.NullOr(BigNumberUnion)),
					completion: S.optional(S.NullOr(BigNumberUnion)),
					image: S.optional(S.NullOr(BigNumberUnion)),
					audio: S.optional(S.NullOr(BigNumberUnion)),
					request: S.optional(S.NullOr(BigNumberUnion)),
				})),
			preferred_min_throughput: S.optional(S.NullOr(PreferredMinThroughput)),
			preferred_max_latency: S.optional(S.NullOr(PreferredMaxLatency)),
		}))),
	/**
	 * Plugins you want to enable for this request, including their settings.
	 */
	plugins: S.optional(S.NullOr(S.Array(
			S.Union([
				S.Struct({
					id: S.Literal("auto-router"),
					/**
					 * Set to false to disable the auto-router plugin for this request. Defaults to true.
					 */
					enabled: S.optional(S.NullOr(S.Boolean)),
					/**
					 * List of model patterns to filter which models the auto-router can route between. Supports wildcards (e.g., "anthropic/*" matches all Anthropic models). When not specified, uses the default supported models list.
					 */
					allowed_models: S.optional(S.NullOr(S.Array(S.String))),
				}),
				S.Struct({
					id: S.Literal("moderation"),
				}),
				S.Struct({
					id: S.Literal("web"),
					/**
					 * Set to false to disable the web-search plugin for this request. Defaults to true.
					 */
					enabled: S.optional(S.NullOr(S.Boolean)),
					max_results: S.optional(S.NullOr(S.Number)),
					search_prompt: S.optional(S.NullOr(S.String)),
					engine: S.optional(S.NullOr(WebSearchEngine)),
				}),
				S.Struct({
					id: S.Literal("file-parser"),
					/**
					 * Set to false to disable the file-parser plugin for this request. Defaults to true.
					 */
					enabled: S.optional(S.NullOr(S.Boolean)),
					pdf: S.optional(S.NullOr(PDFParserOptions)),
				}),
				S.Struct({
					id: S.Literal("response-healing"),
					/**
					 * Set to false to disable the response-healing plugin for this request. Defaults to true.
					 */
					enabled: S.optional(S.NullOr(S.Boolean)),
				}),
			]),
		))),
	/**
	 * **DEPRECATED** Use providers.sort.partition instead. Backwards-compatible alias for providers.sort.partition. Accepts legacy values: "fallback" (maps to "model"), "sort" (maps to "none").
	 */
	route: S.optional(S.NullOr(OpenResponsesRequestRoute)),
	/**
	 * A unique identifier representing your end-user, which helps distinguish between different users of your app. This allows your app to identify specific users in case of abuse reports, preventing your entire app from being affected by the actions of individual users. Maximum of 128 characters.
	 */
	user: S.optional(S.NullOr(S.String.check(S.isMaxLength(128)))),
	/**
	 * A unique identifier for grouping related requests (e.g., a conversation or agent workflow) for observability. If provided in both the request body and the x-session-id header, the body value takes precedence. Maximum of 128 characters.
	 */
	session_id: S.optional(S.NullOr(S.String.check(S.isMaxLength(128)))),
}) {}

export const OutputMessageRole = S.Literal("assistant")

export const OutputMessageType = S.Literal("message")

export const OutputMessageStatusEnum = S.Literal("in_progress")

export class OutputMessage extends S.Class<OutputMessage>("OutputMessage")({
	id: S.String,
	role: OutputMessageRole,
	type: OutputMessageType,
	status: S.optional(S.NullOr(S.Union([OutputMessageStatusEnum, OutputMessageStatusEnum, OutputMessageStatusEnum]))),
	content: S.Array(S.Union([ResponseOutputText, OpenAIResponsesRefusalContent])),
}) {}

export const OutputItemReasoningType = S.Literal("reasoning")

export const OutputItemReasoningStatusEnum = S.Literal("in_progress")

export class OutputItemReasoning extends S.Class<OutputItemReasoning>("OutputItemReasoning")({
	type: OutputItemReasoningType,
	id: S.String,
	content: S.optional(S.NullOr(S.Array(ReasoningTextContent))),
	summary: S.Array(ReasoningSummaryText),
	encrypted_content: S.optional(S.NullOr(S.String)),
	status: S.optional(S.NullOr(S.Union([OutputItemReasoningStatusEnum, OutputItemReasoningStatusEnum, OutputItemReasoningStatusEnum]))),
}) {}

export const OutputItemFunctionCallType = S.Literal("function_call")

export const OutputItemFunctionCallStatusEnum = S.Literal("in_progress")

export class OutputItemFunctionCall extends S.Class<OutputItemFunctionCall>("OutputItemFunctionCall")({
	type: OutputItemFunctionCallType,
	id: S.optional(S.NullOr(S.String)),
	name: S.String,
	arguments: S.String,
	call_id: S.String,
	status: S.optional(S.NullOr(S.Union([
			OutputItemFunctionCallStatusEnum,
			OutputItemFunctionCallStatusEnum,
			OutputItemFunctionCallStatusEnum,
		]))),
}) {}

export const OutputItemWebSearchCallType = S.Literal("web_search_call")

export class OutputItemWebSearchCall extends S.Class<OutputItemWebSearchCall>("OutputItemWebSearchCall")({
	type: OutputItemWebSearchCallType,
	id: S.String,
	status: WebSearchStatus,
}) {}

export const OutputItemFileSearchCallType = S.Literal("file_search_call")

export class OutputItemFileSearchCall extends S.Class<OutputItemFileSearchCall>("OutputItemFileSearchCall")({
	type: OutputItemFileSearchCallType,
	id: S.String,
	queries: S.Array(S.String),
	status: WebSearchStatus,
}) {}

export const OutputItemImageGenerationCallType = S.Literal("image_generation_call")

export class OutputItemImageGenerationCall extends S.Class<OutputItemImageGenerationCall>(
	"OutputItemImageGenerationCall",
)({
	type: OutputItemImageGenerationCallType,
	id: S.String,
	result: S.NullOr(S.String).pipe(S.optional, S.withDecodingDefault(() => null)),
	status: ImageGenerationStatus,
}) {}

export class OpenAIResponsesUsage extends S.Class<OpenAIResponsesUsage>("OpenAIResponsesUsage")({
	input_tokens: S.Number,
	input_tokens_details: S.Struct({
		cached_tokens: S.Number,
	}),
	output_tokens: S.Number,
	output_tokens_details: S.Struct({
		reasoning_tokens: S.Number,
	}),
	total_tokens: S.Number,
}) {}

export const OpenResponsesNonStreamingResponseObject = S.Literal("response")

export const OpenAIResponsesResponseStatus = S.Literals(["completed",
	"incomplete",
	"in_progress",
	"failed",
	"cancelled",
	"queued",])

export const ResponsesErrorFieldCode = S.Literals(["server_error",
	"rate_limit_exceeded",
	"invalid_prompt",
	"vector_store_timeout",
	"invalid_image",
	"invalid_image_format",
	"invalid_base64_image",
	"invalid_image_url",
	"image_too_large",
	"image_too_small",
	"image_parse_error",
	"image_content_policy_violation",
	"invalid_image_mode",
	"image_file_too_large",
	"unsupported_image_media_type",
	"empty_image_file",
	"failed_to_download_image",
	"image_file_not_found",])

/**
 * Error information returned from the API
 */
export class ResponsesErrorField extends S.Class<ResponsesErrorField>("ResponsesErrorField")({
	code: ResponsesErrorFieldCode,
	message: S.String,
}) {}

export const OpenAIResponsesIncompleteDetailsReason = S.Literals(["max_output_tokens",
	"content_filter",])

export class OpenAIResponsesIncompleteDetails extends S.Class<OpenAIResponsesIncompleteDetails>(
	"OpenAIResponsesIncompleteDetails",
)({
	reason: S.optional(S.NullOr(OpenAIResponsesIncompleteDetailsReason)),
}) {}

export const ResponseInputImageType = S.Literal("input_image")

export const ResponseInputImageDetail = S.Literals(["auto", "high", "low"])

/**
 * Image input content item
 */
export class ResponseInputImage extends S.Class<ResponseInputImage>("ResponseInputImage")({
	type: ResponseInputImageType,
	detail: ResponseInputImageDetail,
	image_url: S.optional(S.NullOr(S.String)),
}) {}

export const OpenAIResponsesInput = S.Union([S.String,
	S.Array(
		S.Union([
			S.Struct({
				type: S.optional(S.NullOr(S.Literal("message"))),
				role: S.Union([
					S.Literal("user"),
					S.Literal("system"),
					S.Literal("assistant"),
					S.Literal("developer"),
				]),
				content: S.Union([
					S.Array(
						S.Union([ResponseInputText, ResponseInputImage, ResponseInputFile, ResponseInputAudio]),
					),
					S.String,
				]),
			}),
			S.Struct({
				id: S.String,
				type: S.optional(S.NullOr(S.Literal("message"))),
				role: S.Union([S.Literal("user"), S.Literal("system"), S.Literal("developer")]),
				content: S.Array(
					S.Union([ResponseInputText, ResponseInputImage, ResponseInputFile, ResponseInputAudio]),
				),
			}),
			S.Struct({
				type: S.Literal("function_call_output"),
				id: S.optional(S.NullOr(S.String)),
				call_id: S.String,
				output: S.String,
				status: S.optional(S.NullOr(ToolCallStatus)),
			}),
			S.Struct({
				type: S.Literal("function_call"),
				call_id: S.String,
				name: S.String,
				arguments: S.String,
				id: S.optional(S.NullOr(S.String)),
				status: S.optional(S.NullOr(ToolCallStatus)),
			}),
			OutputItemImageGenerationCall,
			OutputMessage,
		]),
	),])

export class OpenAIResponsesReasoningConfig extends S.Class<OpenAIResponsesReasoningConfig>(
	"OpenAIResponsesReasoningConfig",
)({
	effort: S.optional(S.NullOr(OpenAIResponsesReasoningEffort)),
	summary: S.optional(S.NullOr(ReasoningSummaryVerbosity)),
}) {}

export const OpenAIResponsesServiceTier = S.Literals(["auto", "default", "flex", "priority", "scale"])

export const OpenAIResponsesTruncation = S.Literals(["auto", "disabled"])

export const ResponseTextConfigVerbosity = S.Literals(["high", "low", "medium"])

/**
 * Text output configuration including format and verbosity
 */
export class ResponseTextConfig extends S.Class<ResponseTextConfig>("ResponseTextConfig")({
	format: S.optional(S.NullOr(ResponseFormatTextConfig)),
	verbosity: S.optional(S.NullOr(ResponseTextConfigVerbosity)),
}) {}

export class OpenResponsesNonStreamingResponse extends S.Class<OpenResponsesNonStreamingResponse>(
	"OpenResponsesNonStreamingResponse",
)({
	output: S.Array(
		S.Union([
			OutputMessage,
			OutputItemReasoning,
			OutputItemFunctionCall,
			OutputItemWebSearchCall,
			OutputItemFileSearchCall,
			OutputItemImageGenerationCall,
		]),
	),
	usage: S.optional(S.NullOr(OpenAIResponsesUsage)),
	id: S.String,
	object: OpenResponsesNonStreamingResponseObject,
	created_at: S.Number,
	model: S.String,
	status: OpenAIResponsesResponseStatus,
	completed_at: S.NullOr(S.Number),
	user: S.optional(S.NullOr(S.String)),
	output_text: S.optional(S.NullOr(S.String)),
	prompt_cache_key: S.optional(S.NullOr(S.String)),
	safety_identifier: S.optional(S.NullOr(S.String)),
	error: S.NullOr(ResponsesErrorField),
	incomplete_details: S.NullOr(OpenAIResponsesIncompleteDetails),
	max_tool_calls: S.optional(S.NullOr(S.Number)),
	top_logprobs: S.optional(S.NullOr(S.Number)),
	max_output_tokens: S.optional(S.NullOr(S.Number)),
	temperature: S.NullOr(S.Number),
	top_p: S.NullOr(S.Number),
	presence_penalty: S.NullOr(S.Number),
	frequency_penalty: S.NullOr(S.Number),
	instructions: OpenAIResponsesInput,
	metadata: S.NullOr(OpenResponsesRequestMetadata),
	tools: S.Array(
		S.Union([
			/**
			 * Function tool definition
			 */
			S.Struct({}),
			OpenResponsesWebSearchPreviewTool,
			OpenResponsesWebSearchPreview20250311Tool,
			OpenResponsesWebSearchTool,
			OpenResponsesWebSearch20250826Tool,
		]),
	),
	tool_choice: OpenAIResponsesToolChoice,
	parallel_tool_calls: S.Boolean,
	prompt: S.optional(S.NullOr(OpenAIResponsesPrompt)),
	background: S.optional(S.NullOr(S.Boolean)),
	previous_response_id: S.optional(S.NullOr(S.String)),
	reasoning: S.optional(S.NullOr(OpenAIResponsesReasoningConfig)),
	service_tier: S.optional(S.NullOr(OpenAIResponsesServiceTier)),
	store: S.optional(S.NullOr(S.Boolean)),
	truncation: S.optional(S.NullOr(OpenAIResponsesTruncation)),
	text: S.optional(S.NullOr(ResponseTextConfig)),
}) {}

/**
 * Error data for BadRequestResponse
 */
export class BadRequestResponseErrorData extends S.Class<BadRequestResponseErrorData>(
	"BadRequestResponseErrorData",
)({
	code: S.Int,
	message: S.String,
	metadata: S.optional(S.NullOr(S.Record(S.String, S.Unknown))),
}) {}

/**
 * Bad Request - Invalid request parameters or malformed input
 */
export class BadRequestResponse extends S.Class<BadRequestResponse>("BadRequestResponse")({
	error: BadRequestResponseErrorData,
	user_id: S.optional(S.NullOr(S.String)),
}) {}

/**
 * Error data for UnauthorizedResponse
 */
export class UnauthorizedResponseErrorData extends S.Class<UnauthorizedResponseErrorData>(
	"UnauthorizedResponseErrorData",
)({
	code: S.Int,
	message: S.String,
	metadata: S.optional(S.NullOr(S.Record(S.String, S.Unknown))),
}) {}

/**
 * Unauthorized - Authentication required or invalid credentials
 */
export class UnauthorizedResponse extends S.Class<UnauthorizedResponse>("UnauthorizedResponse")({
	error: UnauthorizedResponseErrorData,
	user_id: S.optional(S.NullOr(S.String)),
}) {}

/**
 * Error data for PaymentRequiredResponse
 */
export class PaymentRequiredResponseErrorData extends S.Class<PaymentRequiredResponseErrorData>(
	"PaymentRequiredResponseErrorData",
)({
	code: S.Int,
	message: S.String,
	metadata: S.optional(S.NullOr(S.Record(S.String, S.Unknown))),
}) {}

/**
 * Payment Required - Insufficient credits or quota to complete request
 */
export class PaymentRequiredResponse extends S.Class<PaymentRequiredResponse>("PaymentRequiredResponse")({
	error: PaymentRequiredResponseErrorData,
	user_id: S.optional(S.NullOr(S.String)),
}) {}

/**
 * Error data for NotFoundResponse
 */
export class NotFoundResponseErrorData extends S.Class<NotFoundResponseErrorData>(
	"NotFoundResponseErrorData",
)({
	code: S.Int,
	message: S.String,
	metadata: S.optional(S.NullOr(S.Record(S.String, S.Unknown))),
}) {}

/**
 * Not Found - Resource does not exist
 */
export class NotFoundResponse extends S.Class<NotFoundResponse>("NotFoundResponse")({
	error: NotFoundResponseErrorData,
	user_id: S.optional(S.NullOr(S.String)),
}) {}

/**
 * Error data for RequestTimeoutResponse
 */
export class RequestTimeoutResponseErrorData extends S.Class<RequestTimeoutResponseErrorData>(
	"RequestTimeoutResponseErrorData",
)({
	code: S.Int,
	message: S.String,
	metadata: S.optional(S.NullOr(S.Record(S.String, S.Unknown))),
}) {}

/**
 * Request Timeout - Operation exceeded time limit
 */
export class RequestTimeoutResponse extends S.Class<RequestTimeoutResponse>("RequestTimeoutResponse")({
	error: RequestTimeoutResponseErrorData,
	user_id: S.optional(S.NullOr(S.String)),
}) {}

/**
 * Error data for PayloadTooLargeResponse
 */
export class PayloadTooLargeResponseErrorData extends S.Class<PayloadTooLargeResponseErrorData>(
	"PayloadTooLargeResponseErrorData",
)({
	code: S.Int,
	message: S.String,
	metadata: S.optional(S.NullOr(S.Record(S.String, S.Unknown))),
}) {}

/**
 * Payload Too Large - Request payload exceeds size limits
 */
export class PayloadTooLargeResponse extends S.Class<PayloadTooLargeResponse>("PayloadTooLargeResponse")({
	error: PayloadTooLargeResponseErrorData,
	user_id: S.optional(S.NullOr(S.String)),
}) {}

/**
 * Error data for UnprocessableEntityResponse
 */
export class UnprocessableEntityResponseErrorData extends S.Class<UnprocessableEntityResponseErrorData>(
	"UnprocessableEntityResponseErrorData",
)({
	code: S.Int,
	message: S.String,
	metadata: S.optional(S.NullOr(S.Record(S.String, S.Unknown))),
}) {}

/**
 * Unprocessable Entity - Semantic validation failure
 */
export class UnprocessableEntityResponse extends S.Class<UnprocessableEntityResponse>(
	"UnprocessableEntityResponse",
)({
	error: UnprocessableEntityResponseErrorData,
	user_id: S.optional(S.NullOr(S.String)),
}) {}

/**
 * Error data for TooManyRequestsResponse
 */
export class TooManyRequestsResponseErrorData extends S.Class<TooManyRequestsResponseErrorData>(
	"TooManyRequestsResponseErrorData",
)({
	code: S.Int,
	message: S.String,
	metadata: S.optional(S.NullOr(S.Record(S.String, S.Unknown))),
}) {}

/**
 * Too Many Requests - Rate limit exceeded
 */
export class TooManyRequestsResponse extends S.Class<TooManyRequestsResponse>("TooManyRequestsResponse")({
	error: TooManyRequestsResponseErrorData,
	user_id: S.optional(S.NullOr(S.String)),
}) {}

/**
 * Error data for InternalServerResponse
 */
export class InternalServerResponseErrorData extends S.Class<InternalServerResponseErrorData>(
	"InternalServerResponseErrorData",
)({
	code: S.Int,
	message: S.String,
	metadata: S.optional(S.NullOr(S.Record(S.String, S.Unknown))),
}) {}

/**
 * Internal Server Error - Unexpected server error
 */
export class InternalServerResponse extends S.Class<InternalServerResponse>("InternalServerResponse")({
	error: InternalServerResponseErrorData,
	user_id: S.optional(S.NullOr(S.String)),
}) {}

/**
 * Error data for BadGatewayResponse
 */
export class BadGatewayResponseErrorData extends S.Class<BadGatewayResponseErrorData>(
	"BadGatewayResponseErrorData",
)({
	code: S.Int,
	message: S.String,
	metadata: S.optional(S.NullOr(S.Record(S.String, S.Unknown))),
}) {}

/**
 * Bad Gateway - Provider/upstream API failure
 */
export class BadGatewayResponse extends S.Class<BadGatewayResponse>("BadGatewayResponse")({
	error: BadGatewayResponseErrorData,
	user_id: S.optional(S.NullOr(S.String)),
}) {}

/**
 * Error data for ServiceUnavailableResponse
 */
export class ServiceUnavailableResponseErrorData extends S.Class<ServiceUnavailableResponseErrorData>(
	"ServiceUnavailableResponseErrorData",
)({
	code: S.Int,
	message: S.String,
	metadata: S.optional(S.NullOr(S.Record(S.String, S.Unknown))),
}) {}

/**
 * Service Unavailable - Service temporarily unavailable
 */
export class ServiceUnavailableResponse extends S.Class<ServiceUnavailableResponse>(
	"ServiceUnavailableResponse",
)({
	error: ServiceUnavailableResponseErrorData,
	user_id: S.optional(S.NullOr(S.String)),
}) {}

/**
 * Error data for EdgeNetworkTimeoutResponse
 */
export class EdgeNetworkTimeoutResponseErrorData extends S.Class<EdgeNetworkTimeoutResponseErrorData>(
	"EdgeNetworkTimeoutResponseErrorData",
)({
	code: S.Int,
	message: S.String,
	metadata: S.optional(S.NullOr(S.Record(S.String, S.Unknown))),
}) {}

/**
 * Infrastructure Timeout - Provider request timed out at edge network
 */
export class EdgeNetworkTimeoutResponse extends S.Class<EdgeNetworkTimeoutResponse>(
	"EdgeNetworkTimeoutResponse",
)({
	error: EdgeNetworkTimeoutResponseErrorData,
	user_id: S.optional(S.NullOr(S.String)),
}) {}

/**
 * Error data for ProviderOverloadedResponse
 */
export class ProviderOverloadedResponseErrorData extends S.Class<ProviderOverloadedResponseErrorData>(
	"ProviderOverloadedResponseErrorData",
)({
	code: S.Int,
	message: S.String,
	metadata: S.optional(S.NullOr(S.Record(S.String, S.Unknown))),
}) {}

/**
 * Provider Overloaded - Provider is temporarily overloaded
 */
export class ProviderOverloadedResponse extends S.Class<ProviderOverloadedResponse>(
	"ProviderOverloadedResponse",
)({
	error: ProviderOverloadedResponseErrorData,
	user_id: S.optional(S.NullOr(S.String)),
}) {}

export const OpenRouterAnthropicMessageParamRole = S.Literals(["user", "assistant"])

/**
 * Anthropic message with OpenRouter extensions
 */
export class OpenRouterAnthropicMessageParam extends S.Class<OpenRouterAnthropicMessageParam>(
	"OpenRouterAnthropicMessageParam",
)({
	role: OpenRouterAnthropicMessageParamRole,
	content: S.Union([
		S.String,
		S.Array(
			S.Union([
				S.Struct({
					type: S.Literal("text"),
					text: S.String,
					citations: S.optional(S.NullOr(S.Array(
							S.Union([
								S.Struct({
									type: S.Literal("char_location"),
									cited_text: S.String,
									document_index: S.Number,
									document_title: S.NullOr(S.String),
									start_char_index: S.Number,
									end_char_index: S.Number,
								}),
								S.Struct({
									type: S.Literal("page_location"),
									cited_text: S.String,
									document_index: S.Number,
									document_title: S.NullOr(S.String),
									start_page_number: S.Number,
									end_page_number: S.Number,
								}),
								S.Struct({
									type: S.Literal("content_block_location"),
									cited_text: S.String,
									document_index: S.Number,
									document_title: S.NullOr(S.String),
									start_block_index: S.Number,
									end_block_index: S.Number,
								}),
								S.Struct({
									type: S.Literal("web_search_result_location"),
									cited_text: S.String,
									encrypted_index: S.String,
									title: S.NullOr(S.String),
									url: S.String,
								}),
								S.Struct({
									type: S.Literal("search_result_location"),
									cited_text: S.String,
									search_result_index: S.Number,
									source: S.String,
									title: S.NullOr(S.String),
									start_block_index: S.Number,
									end_block_index: S.Number,
								}),
							]),
						))),
					cache_control: S.optional(S.NullOr(S.Struct({
							type: S.Literal("ephemeral"),
							ttl: S.optional(S.NullOr(S.Literals(["5m", "1h"]))),
						}))),
				}),
				S.Struct({
					type: S.Literal("image"),
					source: S.Union([
						S.Struct({
							type: S.Literal("base64"),
							media_type: S.Literals(["image/jpeg", "image/png", "image/gif", "image/webp"]),
							data: S.String,
						}),
						S.Struct({
							type: S.Literal("url"),
							url: S.String,
						}),
					]),
					cache_control: S.optional(S.NullOr(S.Struct({
							type: S.Literal("ephemeral"),
							ttl: S.optional(S.NullOr(S.Literals(["5m", "1h"]))),
						}))),
				}),
				S.Struct({
					type: S.Literal("document"),
					source: S.Union([
						S.Struct({
							type: S.Literal("base64"),
							media_type: S.Literal("application/pdf"),
							data: S.String,
						}),
						S.Struct({
							type: S.Literal("text"),
							media_type: S.Literal("text/plain"),
							data: S.String,
						}),
						S.Struct({
							type: S.Literal("content"),
							content: S.Union([
								S.String,
								S.Array(
									S.Union([
										S.Struct({
											type: S.Literal("text"),
											text: S.String,
											citations: S.optional(S.NullOr(S.Array(
													S.Union([
														S.Struct({
															type: S.Literal("char_location"),
															cited_text: S.String,
															document_index: S.Number,
															document_title: S.NullOr(S.String),
															start_char_index: S.Number,
															end_char_index: S.Number,
														}),
														S.Struct({
															type: S.Literal("page_location"),
															cited_text: S.String,
															document_index: S.Number,
															document_title: S.NullOr(S.String),
															start_page_number: S.Number,
															end_page_number: S.Number,
														}),
														S.Struct({
															type: S.Literal("content_block_location"),
															cited_text: S.String,
															document_index: S.Number,
															document_title: S.NullOr(S.String),
															start_block_index: S.Number,
															end_block_index: S.Number,
														}),
														S.Struct({
															type: S.Literal("web_search_result_location"),
															cited_text: S.String,
															encrypted_index: S.String,
															title: S.NullOr(S.String),
															url: S.String,
														}),
														S.Struct({
															type: S.Literal("search_result_location"),
															cited_text: S.String,
															search_result_index: S.Number,
															source: S.String,
															title: S.NullOr(S.String),
															start_block_index: S.Number,
															end_block_index: S.Number,
														}),
													]),
												))),
											cache_control: S.optional(S.NullOr(S.Struct({
													type: S.Literal("ephemeral"),
													ttl: S.optional(S.NullOr(S.Literals(["5m", "1h"]))),
												}))),
										}),
										S.Struct({
											type: S.Literal("image"),
											source: S.Union([
												S.Struct({
													type: S.Literal("base64"),
													media_type: S.Literals([
														"image/jpeg",
														"image/png",
														"image/gif",
														"image/webp",
													]),
													data: S.String,
												}),
												S.Struct({
													type: S.Literal("url"),
													url: S.String,
												}),
											]),
											cache_control: S.optional(S.NullOr(S.Struct({
													type: S.Literal("ephemeral"),
													ttl: S.optional(S.NullOr(S.Literals(["5m", "1h"]))),
												}))),
										}),
									]),
								),
							]),
						}),
						S.Struct({
							type: S.Literal("url"),
							url: S.String,
						}),
					]),
					citations: S.optional(S.NullOr(S.Struct({
							enabled: S.optional(S.NullOr(S.Boolean)),
						}))),
					context: S.optional(S.NullOr(S.String)),
					title: S.optional(S.NullOr(S.String)),
					cache_control: S.optional(S.NullOr(S.Struct({
							type: S.Literal("ephemeral"),
							ttl: S.optional(S.NullOr(S.Literals(["5m", "1h"]))),
						}))),
				}),
				S.Struct({
					type: S.Literal("tool_use"),
					id: S.String,
					name: S.String,
					cache_control: S.optional(S.NullOr(S.Struct({
							type: S.Literal("ephemeral"),
							ttl: S.optional(S.NullOr(S.Literals(["5m", "1h"]))),
						}))),
				}),
				S.Struct({
					type: S.Literal("tool_result"),
					tool_use_id: S.String,
					content: S.optional(S.NullOr(S.Union([
							S.String,
							S.Array(
								S.Union([
									S.Struct({
										type: S.Literal("text"),
										text: S.String,
										citations: S.optional(S.Array(
												S.Union([
													S.Struct({
														type: S.Literal("char_location"),
														cited_text: S.String,
														document_index: S.Number,
														document_title: S.NullOr(S.String),
														start_char_index: S.Number,
														end_char_index: S.Number,
													}),
													S.Struct({
														type: S.Literal("page_location"),
														cited_text: S.String,
														document_index: S.Number,
														document_title: S.NullOr(S.String),
														start_page_number: S.Number,
														end_page_number: S.Number,
													}),
													S.Struct({
														type: S.Literal("content_block_location"),
														cited_text: S.String,
														document_index: S.Number,
														document_title: S.NullOr(S.String),
														start_block_index: S.Number,
														end_block_index: S.Number,
													}),
													S.Struct({
														type: S.Literal("web_search_result_location"),
														cited_text: S.String,
														encrypted_index: S.String,
														title: S.NullOr(S.String),
														url: S.String,
													}),
													S.Struct({
														type: S.Literal("search_result_location"),
														cited_text: S.String,
														search_result_index: S.Number,
														source: S.String,
														title: S.NullOr(S.String),
														start_block_index: S.Number,
														end_block_index: S.Number,
													}),
												]),
											)),
										cache_control: S.optional(S.Struct({
												type: S.Literal("ephemeral"),
												ttl: S.optional(S.NullOr(S.Literals(["5m", "1h"]))),
											})),
									}),
									S.Struct({
										type: S.Literal("image"),
										source: S.Union([
											S.Struct({
												type: S.Literal("base64"),
												media_type: S.Literals([
													"image/jpeg",
													"image/png",
													"image/gif",
													"image/webp",
												]),
												data: S.String,
											}),
											S.Struct({
												type: S.Literal("url"),
												url: S.String,
											}),
										]),
										cache_control: S.optional(S.Struct({
												type: S.Literal("ephemeral"),
												ttl: S.optional(S.NullOr(S.Literals(["5m", "1h"]))),
											})),
									}),
								]),
							),
						]))),
					is_error: S.optional(S.NullOr(S.Boolean)),
					cache_control: S.optional(S.NullOr(S.Struct({
							type: S.Literal("ephemeral"),
							ttl: S.optional(S.NullOr(S.Literals(["5m", "1h"]))),
						}))),
				}),
				S.Struct({
					type: S.Literal("thinking"),
					thinking: S.String,
					signature: S.String,
				}),
				S.Struct({
					type: S.Literal("redacted_thinking"),
					data: S.String,
				}),
				S.Struct({
					type: S.Literal("server_tool_use"),
					id: S.String,
					name: S.Literal("web_search"),
					cache_control: S.optional(S.NullOr(S.Struct({
							type: S.Literal("ephemeral"),
							ttl: S.optional(S.NullOr(S.Literals(["5m", "1h"]))),
						}))),
				}),
				S.Struct({
					type: S.Literal("web_search_tool_result"),
					tool_use_id: S.String,
					content: S.Union([
						S.Array(
							S.Struct({
								type: S.Literal("web_search_result"),
								encrypted_content: S.String,
								title: S.String,
								url: S.String,
								page_age: S.optional(S.NullOr(S.String)),
							}),
						),
						S.Struct({
							type: S.Literal("web_search_tool_result_error"),
							error_code: S.Literals([
								"invalid_tool_input",
								"unavailable",
								"max_uses_exceeded",
								"too_many_requests",
								"query_too_long",
							]),
						}),
					]),
					cache_control: S.optional(S.NullOr(S.Struct({
							type: S.Literal("ephemeral"),
							ttl: S.optional(S.NullOr(S.Literals(["5m", "1h"]))),
						}))),
				}),
				S.Struct({
					type: S.Literal("search_result"),
					source: S.String,
					title: S.String,
					content: S.Array(
						S.Struct({
							type: S.Literal("text"),
							text: S.String,
							citations: S.optional(S.NullOr(S.Array(
									S.Union([
										S.Struct({
											type: S.Literal("char_location"),
											cited_text: S.String,
											document_index: S.Number,
											document_title: S.NullOr(S.String),
											start_char_index: S.Number,
											end_char_index: S.Number,
										}),
										S.Struct({
											type: S.Literal("page_location"),
											cited_text: S.String,
											document_index: S.Number,
											document_title: S.NullOr(S.String),
											start_page_number: S.Number,
											end_page_number: S.Number,
										}),
										S.Struct({
											type: S.Literal("content_block_location"),
											cited_text: S.String,
											document_index: S.Number,
											document_title: S.NullOr(S.String),
											start_block_index: S.Number,
											end_block_index: S.Number,
										}),
										S.Struct({
											type: S.Literal("web_search_result_location"),
											cited_text: S.String,
											encrypted_index: S.String,
											title: S.NullOr(S.String),
											url: S.String,
										}),
										S.Struct({
											type: S.Literal("search_result_location"),
											cited_text: S.String,
											search_result_index: S.Number,
											source: S.String,
											title: S.NullOr(S.String),
											start_block_index: S.Number,
											end_block_index: S.Number,
										}),
									]),
								))),
							cache_control: S.optional(S.NullOr(S.Struct({
									type: S.Literal("ephemeral"),
									ttl: S.optional(S.NullOr(S.Literals(["5m", "1h"]))),
								}))),
						}),
					),
					citations: S.optional(S.NullOr(S.Struct({
							enabled: S.optional(S.NullOr(S.Boolean)),
						}))),
					cache_control: S.optional(S.NullOr(S.Struct({
							type: S.Literal("ephemeral"),
							ttl: S.optional(S.NullOr(S.Literals(["5m", "1h"]))),
						}))),
				}),
			]),
		),
	]),
}) {}

export const AnthropicMessagesRequestToolChoiceEnumType = S.Literal("tool")

export const AnthropicMessagesRequestThinkingEnumType = S.Literal("disabled")

export const AnthropicMessagesRequestServiceTier = S.Literals(["auto", "standard_only"])

/**
 * The sorting strategy to use for this request, if "order" is not specified. When set, no load balancing is performed.
 */
export const AnthropicMessagesRequestProviderSort = S.Literals(["price", "throughput", "latency"])

/**
 * **DEPRECATED** Use providers.sort.partition instead. Backwards-compatible alias for providers.sort.partition. Accepts legacy values: "fallback" (maps to "model"), "sort" (maps to "none").
 */
export const AnthropicMessagesRequestRoute = S.Literals(["fallback", "sort"])

/**
 * Request schema for Anthropic Messages API endpoint
 */
export class AnthropicMessagesRequest extends S.Class<AnthropicMessagesRequest>("AnthropicMessagesRequest")({
	model: S.String,
	max_tokens: S.Number,
	messages: S.Array(OpenRouterAnthropicMessageParam),
	system: S.optional(S.NullOr(S.Union([
			S.String,
			S.Array(
				S.Struct({
					type: S.Literal("text"),
					text: S.String,
					citations: S.optional(S.Array(
							S.Union([
								S.Struct({
									type: S.Literal("char_location"),
									cited_text: S.String,
									document_index: S.Number,
									document_title: S.NullOr(S.String),
									start_char_index: S.Number,
									end_char_index: S.Number,
								}),
								S.Struct({
									type: S.Literal("page_location"),
									cited_text: S.String,
									document_index: S.Number,
									document_title: S.NullOr(S.String),
									start_page_number: S.Number,
									end_page_number: S.Number,
								}),
								S.Struct({
									type: S.Literal("content_block_location"),
									cited_text: S.String,
									document_index: S.Number,
									document_title: S.NullOr(S.String),
									start_block_index: S.Number,
									end_block_index: S.Number,
								}),
								S.Struct({
									type: S.Literal("web_search_result_location"),
									cited_text: S.String,
									encrypted_index: S.String,
									title: S.NullOr(S.String),
									url: S.String,
								}),
								S.Struct({
									type: S.Literal("search_result_location"),
									cited_text: S.String,
									search_result_index: S.Number,
									source: S.String,
									title: S.NullOr(S.String),
									start_block_index: S.Number,
									end_block_index: S.Number,
								}),
							]),
						)),
					cache_control: S.optional(S.Struct({
							type: S.Literal("ephemeral"),
							ttl: S.optional(S.NullOr(S.Literals(["5m", "1h"]))),
						})),
				}),
			),
		]))),
	metadata: S.optional(S.NullOr(S.Struct({
			user_id: S.optional(S.NullOr(S.String)),
		}))),
	stop_sequences: S.optional(S.NullOr(S.Array(S.String))),
	stream: S.optional(S.NullOr(S.Boolean)),
	temperature: S.optional(S.NullOr(S.Number)),
	top_p: S.optional(S.NullOr(S.Number)),
	top_k: S.optional(S.NullOr(S.Number)),
	tools: S.optional(S.NullOr(S.Array(
			S.Union([
				S.Struct({
					name: S.String,
					description: S.optional(S.NullOr(S.String)),
					input_schema: S.Struct({
						type: S.Literal("object"),
						required: S.optional(S.NullOr(S.Array(S.String))),
					}),
					type: S.optional(S.NullOr(S.Literal("custom"))),
					cache_control: S.optional(S.Struct({
							type: S.Literal("ephemeral"),
							ttl: S.optional(S.NullOr(S.Literals(["5m", "1h"]))),
						})),
				}),
				S.Struct({
					type: S.Literal("bash_20250124"),
					name: S.Literal("bash"),
					cache_control: S.optional(S.Struct({
							type: S.Literal("ephemeral"),
							ttl: S.optional(S.NullOr(S.Literals(["5m", "1h"]))),
						})),
				}),
				S.Struct({
					type: S.Literal("text_editor_20250124"),
					name: S.Literal("str_replace_editor"),
					cache_control: S.optional(S.Struct({
							type: S.Literal("ephemeral"),
							ttl: S.optional(S.NullOr(S.Literals(["5m", "1h"]))),
						})),
				}),
				S.Struct({
					type: S.Literal("web_search_20250305"),
					name: S.Literal("web_search"),
					allowed_domains: S.optional(S.NullOr(S.Array(S.String))),
					blocked_domains: S.optional(S.NullOr(S.Array(S.String))),
					max_uses: S.optional(S.NullOr(S.Number)),
					user_location: S.optional(S.Struct({
							type: S.Literal("approximate"),
							city: S.optional(S.NullOr(S.String)),
							country: S.optional(S.NullOr(S.String)),
							region: S.optional(S.NullOr(S.String)),
							timezone: S.optional(S.NullOr(S.String)),
						})),
					cache_control: S.optional(S.Struct({
							type: S.Literal("ephemeral"),
							ttl: S.optional(S.NullOr(S.Literals(["5m", "1h"]))),
						})),
				}),
			]),
		))),
	tool_choice: S.optional(S.NullOr(S.Union([
			S.Struct({
				type: AnthropicMessagesRequestToolChoiceEnumType,
				disable_parallel_tool_use: S.optional(S.NullOr(S.Boolean)),
			}),
			S.Struct({
				type: AnthropicMessagesRequestToolChoiceEnumType,
				disable_parallel_tool_use: S.optional(S.NullOr(S.Boolean)),
			}),
			S.Struct({
				type: AnthropicMessagesRequestToolChoiceEnumType,
			}),
			S.Struct({
				type: AnthropicMessagesRequestToolChoiceEnumType,
				name: S.String,
				disable_parallel_tool_use: S.optional(S.NullOr(S.Boolean)),
			}),
		]))),
	thinking: S.optional(S.NullOr(S.Union([
			S.Struct({
				type: AnthropicMessagesRequestThinkingEnumType,
				budget_tokens: S.Number,
			}),
			S.Struct({
				type: AnthropicMessagesRequestThinkingEnumType,
			}),
		]))),
	service_tier: S.optional(S.NullOr(AnthropicMessagesRequestServiceTier)),
	/**
	 * When multiple model providers are available, optionally indicate your routing preference.
	 */
	provider: S.optional(S.NullOr(S.Struct({
			/**
			 * Whether to allow backup providers to serve requests
			 * - true: (default) when the primary provider (or your custom providers in "order") is unavailable, use the next best provider.
			 * - false: use only the primary/custom provider, and return the upstream error if it's unavailable.
			 */
			allow_fallbacks: S.optional(S.NullOr(S.Boolean)),
			/**
			 * Whether to filter providers to only those that support the parameters you've provided. If this setting is omitted or set to false, then providers will receive only the parameters they support, and ignore the rest.
			 */
			require_parameters: S.optional(S.NullOr(S.Boolean)),
			data_collection: S.optional(S.NullOr(DataCollection)),
			/**
			 * Whether to restrict routing to only ZDR (Zero Data Retention) endpoints. When true, only endpoints that do not retain prompts will be used.
			 */
			zdr: S.optional(S.NullOr(S.Boolean)),
			/**
			 * Whether to restrict routing to only models that allow text distillation. When true, only models where the author has allowed distillation will be used.
			 */
			enforce_distillable_text: S.optional(S.NullOr(S.Boolean)),
			/**
			 * An ordered list of provider slugs. The router will attempt to use the first provider in the subset of this list that supports your requested model, and fall back to the next if it is unavailable. If no providers are available, the request will fail with an error message.
			 */
			order: S.optional(S.NullOr(S.Array(S.Union([ProviderName, S.String])))),
			/**
			 * List of provider slugs to allow. If provided, this list is merged with your account-wide allowed provider settings for this request.
			 */
			only: S.optional(S.NullOr(S.Array(S.Union([ProviderName, S.String])))),
			/**
			 * List of provider slugs to ignore. If provided, this list is merged with your account-wide ignored provider settings for this request.
			 */
			ignore: S.optional(S.NullOr(S.Array(S.Union([ProviderName, S.String])))),
			/**
			 * A list of quantization levels to filter the provider by.
			 */
			quantizations: S.optional(S.NullOr(S.Array(Quantization))),
			sort: S.optional(S.NullOr(AnthropicMessagesRequestProviderSort)),
			/**
			 * The object specifying the maximum price you want to pay for this request. USD price per million tokens, for prompt and completion.
			 */
			max_price: S.optional(S.Struct({
					prompt: S.optional(S.NullOr(BigNumberUnion)),
					completion: S.optional(S.NullOr(BigNumberUnion)),
					image: S.optional(S.NullOr(BigNumberUnion)),
					audio: S.optional(S.NullOr(BigNumberUnion)),
					request: S.optional(S.NullOr(BigNumberUnion)),
				})),
			preferred_min_throughput: S.optional(S.NullOr(PreferredMinThroughput)),
			preferred_max_latency: S.optional(S.NullOr(PreferredMaxLatency)),
		}))),
	/**
	 * Plugins you want to enable for this request, including their settings.
	 */
	plugins: S.optional(S.NullOr(S.Array(
			S.Union([
				S.Struct({
					id: S.Literal("auto-router"),
					/**
					 * Set to false to disable the auto-router plugin for this request. Defaults to true.
					 */
					enabled: S.optional(S.NullOr(S.Boolean)),
					/**
					 * List of model patterns to filter which models the auto-router can route between. Supports wildcards (e.g., "anthropic/*" matches all Anthropic models). When not specified, uses the default supported models list.
					 */
					allowed_models: S.optional(S.NullOr(S.Array(S.String))),
				}),
				S.Struct({
					id: S.Literal("moderation"),
				}),
				S.Struct({
					id: S.Literal("web"),
					/**
					 * Set to false to disable the web-search plugin for this request. Defaults to true.
					 */
					enabled: S.optional(S.NullOr(S.Boolean)),
					max_results: S.optional(S.NullOr(S.Number)),
					search_prompt: S.optional(S.NullOr(S.String)),
					engine: S.optional(S.NullOr(WebSearchEngine)),
				}),
				S.Struct({
					id: S.Literal("file-parser"),
					/**
					 * Set to false to disable the file-parser plugin for this request. Defaults to true.
					 */
					enabled: S.optional(S.NullOr(S.Boolean)),
					pdf: S.optional(S.NullOr(PDFParserOptions)),
				}),
				S.Struct({
					id: S.Literal("response-healing"),
					/**
					 * Set to false to disable the response-healing plugin for this request. Defaults to true.
					 */
					enabled: S.optional(S.NullOr(S.Boolean)),
				}),
			]),
		))),
	/**
	 * **DEPRECATED** Use providers.sort.partition instead. Backwards-compatible alias for providers.sort.partition. Accepts legacy values: "fallback" (maps to "model"), "sort" (maps to "none").
	 */
	route: S.optional(S.NullOr(AnthropicMessagesRequestRoute)),
	/**
	 * A unique identifier representing your end-user, which helps distinguish between different users of your app. This allows your app to identify specific users in case of abuse reports, preventing your entire app from being affected by the actions of individual users. Maximum of 128 characters.
	 */
	user: S.optional(S.NullOr(S.String.check(S.isMaxLength(128)))),
	/**
	 * A unique identifier for grouping related requests (e.g., a conversation or agent workflow) for observability. If provided in both the request body and the x-session-id header, the body value takes precedence. Maximum of 128 characters.
	 */
	session_id: S.optional(S.NullOr(S.String.check(S.isMaxLength(128)))),
	models: S.optional(S.NullOr(S.Array(S.String))),
}) {}

export const AnthropicMessagesResponseType = S.Literal("message")

export const AnthropicMessagesResponseRole = S.Literal("assistant")

export const AnthropicMessagesResponseStopReason = S.Literals(["end_turn",
	"max_tokens",
	"stop_sequence",
	"tool_use",
	"pause_turn",
	"refusal",
	"model_context_window_exceeded",])

export const AnthropicMessagesResponseUsageServiceTier = S.Literals(["standard", "priority", "batch"])

export class AnthropicMessagesResponse extends S.Class<AnthropicMessagesResponse>(
	"AnthropicMessagesResponse",
)({
	id: S.String,
	type: AnthropicMessagesResponseType,
	role: AnthropicMessagesResponseRole,
	content: S.Array(
		S.Union([
			S.Struct({
				type: S.Literal("text"),
				text: S.String,
				citations: S.NullOr(
					S.Array(
						S.Union([
							S.Struct({
								type: S.Literal("char_location"),
								cited_text: S.String,
								document_index: S.Number,
								document_title: S.NullOr(S.String),
								start_char_index: S.Number,
								end_char_index: S.Number,
								file_id: S.NullOr(S.String),
							}),
							S.Struct({
								type: S.Literal("page_location"),
								cited_text: S.String,
								document_index: S.Number,
								document_title: S.NullOr(S.String),
								start_page_number: S.Number,
								end_page_number: S.Number,
								file_id: S.NullOr(S.String),
							}),
							S.Struct({
								type: S.Literal("content_block_location"),
								cited_text: S.String,
								document_index: S.Number,
								document_title: S.NullOr(S.String),
								start_block_index: S.Number,
								end_block_index: S.Number,
								file_id: S.NullOr(S.String),
							}),
							S.Struct({
								type: S.Literal("web_search_result_location"),
								cited_text: S.String,
								encrypted_index: S.String,
								title: S.NullOr(S.String),
								url: S.String,
							}),
							S.Struct({
								type: S.Literal("search_result_location"),
								cited_text: S.String,
								search_result_index: S.Number,
								source: S.String,
								title: S.NullOr(S.String),
								start_block_index: S.Number,
								end_block_index: S.Number,
							}),
						]),
					),
				),
			}),
			S.Struct({
				type: S.Literal("tool_use"),
				id: S.String,
				name: S.String,
			}),
			S.Struct({
				type: S.Literal("thinking"),
				thinking: S.String,
				signature: S.String,
			}),
			S.Struct({
				type: S.Literal("redacted_thinking"),
				data: S.String,
			}),
			S.Struct({
				type: S.Literal("server_tool_use"),
				id: S.String,
				name: S.Literal("web_search"),
			}),
			S.Struct({
				type: S.Literal("web_search_tool_result"),
				tool_use_id: S.String,
				content: S.Union([
					S.Array(
						S.Struct({
							type: S.Literal("web_search_result"),
							encrypted_content: S.String,
							page_age: S.NullOr(S.String),
							title: S.String,
							url: S.String,
						}),
					),
					S.Struct({
						type: S.Literal("web_search_tool_result_error"),
						error_code: S.Literals([
							"invalid_tool_input",
							"unavailable",
							"max_uses_exceeded",
							"too_many_requests",
							"query_too_long",
						]),
					}),
				]),
			}),
		]),
	),
	model: S.String,
	stop_reason: S.NullOr(AnthropicMessagesResponseStopReason),
	stop_sequence: S.NullOr(S.String),
	usage: S.Struct({
		input_tokens: S.Number,
		output_tokens: S.Number,
		cache_creation_input_tokens: S.NullOr(S.Number),
		cache_read_input_tokens: S.NullOr(S.Number),
		cache_creation: S.NullOr(
			S.Struct({
				ephemeral_5m_input_tokens: S.Number,
				ephemeral_1h_input_tokens: S.Number,
			}),
		),
		server_tool_use: S.NullOr(
			S.Struct({
				web_search_requests: S.Number,
			}),
		),
		service_tier: S.NullOr(AnthropicMessagesResponseUsageServiceTier),
	}),
}) {}

export const CreateMessages400Type = S.Literal("error")

export const CreateMessages400 = S.Struct({
	type: CreateMessages400Type,
	error: S.Struct({
		type: S.String,
		message: S.String,
	}),
})

export const CreateMessages401Type = S.Literal("error")

export const CreateMessages401 = S.Struct({
	type: CreateMessages401Type,
	error: S.Struct({
		type: S.String,
		message: S.String,
	}),
})

export const CreateMessages403Type = S.Literal("error")

export const CreateMessages403 = S.Struct({
	type: CreateMessages403Type,
	error: S.Struct({
		type: S.String,
		message: S.String,
	}),
})

export const CreateMessages404Type = S.Literal("error")

export const CreateMessages404 = S.Struct({
	type: CreateMessages404Type,
	error: S.Struct({
		type: S.String,
		message: S.String,
	}),
})

export const CreateMessages429Type = S.Literal("error")

export const CreateMessages429 = S.Struct({
	type: CreateMessages429Type,
	error: S.Struct({
		type: S.String,
		message: S.String,
	}),
})

export const CreateMessages500Type = S.Literal("error")

export const CreateMessages500 = S.Struct({
	type: CreateMessages500Type,
	error: S.Struct({
		type: S.String,
		message: S.String,
	}),
})

export const CreateMessages503Type = S.Literal("error")

export const CreateMessages503 = S.Struct({
	type: CreateMessages503Type,
	error: S.Struct({
		type: S.String,
		message: S.String,
	}),
})

export const CreateMessages529Type = S.Literal("error")

export const CreateMessages529 = S.Struct({
	type: CreateMessages529Type,
	error: S.Struct({
		type: S.String,
		message: S.String,
	}),
})

export const GetUserActivityParams = S.Struct({
	/**
	 * Filter by a single UTC date in the last 30 days (YYYY-MM-DD format).
	 */
	date: S.optional(S.NullOr(S.String)),
})

export class ActivityItem extends S.Class<ActivityItem>("ActivityItem")({
	/**
	 * Date of the activity (YYYY-MM-DD format)
	 */
	date: S.String,
	/**
	 * Model slug (e.g., "openai/gpt-4.1")
	 */
	model: S.String,
	/**
	 * Model permaslug (e.g., "openai/gpt-4.1-2025-04-14")
	 */
	model_permaslug: S.String,
	/**
	 * Unique identifier for the endpoint
	 */
	endpoint_id: S.String,
	/**
	 * Name of the provider serving this endpoint
	 */
	provider_name: S.String,
	/**
	 * Total cost in USD (OpenRouter credits spent)
	 */
	usage: S.Number,
	/**
	 * BYOK inference cost in USD (external credits spent)
	 */
	byok_usage_inference: S.Number,
	/**
	 * Number of requests made
	 */
	requests: S.Number,
	/**
	 * Total prompt tokens used
	 */
	prompt_tokens: S.Number,
	/**
	 * Total completion tokens generated
	 */
	completion_tokens: S.Number,
	/**
	 * Total reasoning tokens used
	 */
	reasoning_tokens: S.Number,
}) {}

export const GetUserActivity200 = S.Struct({
	/**
	 * List of activity items
	 */
	data: S.Array(ActivityItem),
})

/**
 * Error data for ForbiddenResponse
 */
export class ForbiddenResponseErrorData extends S.Class<ForbiddenResponseErrorData>(
	"ForbiddenResponseErrorData",
)({
	code: S.Int,
	message: S.String,
	metadata: S.optional(S.NullOr(S.Record(S.String, S.Unknown))),
}) {}

/**
 * Forbidden - Authentication successful but insufficient permissions
 */
export class ForbiddenResponse extends S.Class<ForbiddenResponse>("ForbiddenResponse")({
	error: ForbiddenResponseErrorData,
	user_id: S.optional(S.NullOr(S.String)),
}) {}

/**
 * Total credits purchased and used
 */
export const GetCredits200 = S.Struct({
	data: S.Struct({
		/**
		 * Total credits purchased
		 */
		total_credits: S.Number,
		/**
		 * Total credits used
		 */
		total_usage: S.Number,
	}),
})

export const CreateChargeRequestChainId = S.Literals([1, 137, 8453])

/**
 * Create a Coinbase charge for crypto payment
 */
export class CreateChargeRequest extends S.Class<CreateChargeRequest>("CreateChargeRequest")({
	amount: S.Number,
	sender: S.String,
	chain_id: CreateChargeRequestChainId,
}) {}

export const CreateCoinbaseCharge200 = S.Struct({
	data: S.Struct({
		id: S.String,
		created_at: S.String,
		expires_at: S.String,
		web3_data: S.Struct({
			transfer_intent: S.Struct({
				call_data: S.Struct({
					deadline: S.String,
					fee_amount: S.String,
					id: S.String,
					operator: S.String,
					prefix: S.String,
					recipient: S.String,
					recipient_amount: S.String,
					recipient_currency: S.String,
					refund_destination: S.String,
					signature: S.String,
				}),
				metadata: S.Struct({
					chain_id: S.Number,
					contract_address: S.String,
					sender: S.String,
				}),
			}),
		}),
	}),
})

export const CreateEmbeddingsRequestEncodingFormat = S.Literals(["float", "base64"])

/**
 * The sorting strategy to use for this request, if "order" is not specified. When set, no load balancing is performed.
 */
export const ProviderPreferencesSort = S.Literals(["price", "throughput", "latency"])

/**
 * Provider routing preferences for the request.
 */
export class ProviderPreferences extends S.Class<ProviderPreferences>("ProviderPreferences")({
	/**
	 * Whether to allow backup providers to serve requests
	 * - true: (default) when the primary provider (or your custom providers in "order") is unavailable, use the next best provider.
	 * - false: use only the primary/custom provider, and return the upstream error if it's unavailable.
	 */
	allow_fallbacks: S.optional(S.NullOr(S.Boolean)),
	/**
	 * Whether to filter providers to only those that support the parameters you've provided. If this setting is omitted or set to false, then providers will receive only the parameters they support, and ignore the rest.
	 */
	require_parameters: S.optional(S.NullOr(S.Boolean)),
	data_collection: S.optional(S.NullOr(DataCollection)),
	/**
	 * Whether to restrict routing to only ZDR (Zero Data Retention) endpoints. When true, only endpoints that do not retain prompts will be used.
	 */
	zdr: S.optional(S.NullOr(S.Boolean)),
	/**
	 * Whether to restrict routing to only models that allow text distillation. When true, only models where the author has allowed distillation will be used.
	 */
	enforce_distillable_text: S.optional(S.NullOr(S.Boolean)),
	/**
	 * An ordered list of provider slugs. The router will attempt to use the first provider in the subset of this list that supports your requested model, and fall back to the next if it is unavailable. If no providers are available, the request will fail with an error message.
	 */
	order: S.optional(S.NullOr(S.Array(S.Union([ProviderName, S.String])))),
	/**
	 * List of provider slugs to allow. If provided, this list is merged with your account-wide allowed provider settings for this request.
	 */
	only: S.optional(S.NullOr(S.Array(S.Union([ProviderName, S.String])))),
	/**
	 * List of provider slugs to ignore. If provided, this list is merged with your account-wide ignored provider settings for this request.
	 */
	ignore: S.optional(S.NullOr(S.Array(S.Union([ProviderName, S.String])))),
	/**
	 * A list of quantization levels to filter the provider by.
	 */
	quantizations: S.optional(S.NullOr(S.Array(Quantization))),
	sort: S.optional(S.NullOr(ProviderPreferencesSort)),
	/**
	 * The object specifying the maximum price you want to pay for this request. USD price per million tokens, for prompt and completion.
	 */
	max_price: S.optional(S.NullOr(S.Struct({
			prompt: S.optional(S.NullOr(BigNumberUnion)),
			completion: S.optional(S.NullOr(BigNumberUnion)),
			image: S.optional(S.NullOr(BigNumberUnion)),
			audio: S.optional(S.NullOr(BigNumberUnion)),
			request: S.optional(S.NullOr(BigNumberUnion)),
		}))),
	preferred_min_throughput: S.optional(S.NullOr(PreferredMinThroughput)),
	preferred_max_latency: S.optional(S.NullOr(PreferredMaxLatency)),
}) {}

export class CreateEmbeddingsRequest extends S.Class<CreateEmbeddingsRequest>("CreateEmbeddingsRequest")({
	input: S.Union([
		S.String,
		S.Array(S.String),
		S.Array(S.Number),
		S.Array(S.Array(S.Number)),
		S.Array(
			S.Struct({
				content: S.Array(
					S.Union([
						S.Struct({
							type: S.Literal("text"),
							text: S.String,
						}),
						S.Struct({
							type: S.Literal("image_url"),
							image_url: S.Struct({
								url: S.String,
							}),
						}),
					]),
				),
			}),
		),
	]),
	model: S.String,
	encoding_format: S.optional(S.NullOr(CreateEmbeddingsRequestEncodingFormat)),
	dimensions: S.optional(S.NullOr(S.Int.check(S.isGreaterThan(0)))),
	user: S.optional(S.NullOr(S.String)),
	provider: S.optional(S.NullOr(ProviderPreferences)),
	input_type: S.optional(S.NullOr(S.String)),
}) {}

export const CreateEmbeddings200Object = S.Literal("list")

export const CreateEmbeddings200 = S.Struct({
	id: S.optional(S.NullOr(S.String)),
	object: CreateEmbeddings200Object,
	data: S.Array(
		S.Struct({
			object: S.Literal("embedding"),
			embedding: S.Union([S.Array(S.Number), S.String]),
			index: S.optional(S.NullOr(S.Number)),
		}),
	),
	model: S.String,
	usage: S.optional(S.NullOr(S.Struct({
			prompt_tokens: S.Number,
			total_tokens: S.Number,
			cost: S.optional(S.NullOr(S.Number)),
		}))),
})

/**
 * Pricing information for the model
 */
export class PublicPricing extends S.Class<PublicPricing>("PublicPricing")({
	prompt: BigNumberUnion,
	completion: BigNumberUnion,
	request: S.optional(S.NullOr(BigNumberUnion)),
	image: S.optional(S.NullOr(BigNumberUnion)),
	image_token: S.optional(S.NullOr(BigNumberUnion)),
	image_output: S.optional(S.NullOr(BigNumberUnion)),
	audio: S.optional(S.NullOr(BigNumberUnion)),
	audio_output: S.optional(S.NullOr(BigNumberUnion)),
	input_audio_cache: S.optional(S.NullOr(BigNumberUnion)),
	web_search: S.optional(S.NullOr(BigNumberUnion)),
	internal_reasoning: S.optional(S.NullOr(BigNumberUnion)),
	input_cache_read: S.optional(S.NullOr(BigNumberUnion)),
	input_cache_write: S.optional(S.NullOr(BigNumberUnion)),
	discount: S.optional(S.NullOr(S.Number)),
}) {}

/**
 * Tokenizer type used by the model
 */
export const ModelGroup = S.Literals(["Router",
	"Media",
	"Other",
	"GPT",
	"Claude",
	"Gemini",
	"Grok",
	"Cohere",
	"Nova",
	"Qwen",
	"Yi",
	"DeepSeek",
	"Mistral",
	"Llama2",
	"Llama3",
	"Llama4",
	"PaLM",
	"RWKV",
	"Qwen3",])

/**
 * Instruction format type
 */
export const ModelArchitectureInstructType = S.Literals(["none",
	"airoboros",
	"alpaca",
	"alpaca-modif",
	"chatml",
	"claude",
	"code-llama",
	"gemma",
	"llama2",
	"llama3",
	"mistral",
	"nemotron",
	"neural",
	"openchat",
	"phi3",
	"rwkv",
	"vicuna",
	"zephyr",
	"deepseek-r1",
	"deepseek-v3.1",
	"qwq",
	"qwen3",])

export const InputModality = S.Literals(["text", "image", "file", "audio", "video"])

export const OutputModality = S.Literals(["text", "image", "embeddings", "audio"])

/**
 * Model architecture information
 */
export class ModelArchitecture extends S.Class<ModelArchitecture>("ModelArchitecture")({
	tokenizer: S.optional(S.NullOr(ModelGroup)),
	/**
	 * Instruction format type
	 */
	instruct_type: S.optional(S.NullOr(ModelArchitectureInstructType)),
	/**
	 * Primary modality of the model
	 */
	modality: S.NullOr(S.String),
	/**
	 * Supported input modalities
	 */
	input_modalities: S.Array(InputModality),
	/**
	 * Supported output modalities
	 */
	output_modalities: S.Array(OutputModality),
}) {}

/**
 * Information about the top provider for this model
 */
export class TopProviderInfo extends S.Class<TopProviderInfo>("TopProviderInfo")({
	/**
	 * Context length from the top provider
	 */
	context_length: S.optional(S.NullOr(S.Number)),
	/**
	 * Maximum completion tokens from the top provider
	 */
	max_completion_tokens: S.optional(S.NullOr(S.Number)),
	/**
	 * Whether the top provider moderates content
	 */
	is_moderated: S.Boolean,
}) {}

/**
 * Per-request token limits
 */
export class PerRequestLimits extends S.Class<PerRequestLimits>("PerRequestLimits")({
	/**
	 * Maximum prompt tokens per request
	 */
	prompt_tokens: S.Number,
	/**
	 * Maximum completion tokens per request
	 */
	completion_tokens: S.Number,
}) {}

export const Parameter = S.Literals(["temperature",
	"top_p",
	"top_k",
	"min_p",
	"top_a",
	"frequency_penalty",
	"presence_penalty",
	"repetition_penalty",
	"max_tokens",
	"logit_bias",
	"logprobs",
	"top_logprobs",
	"seed",
	"response_format",
	"structured_outputs",
	"stop",
	"tools",
	"tool_choice",
	"parallel_tool_calls",
	"include_reasoning",
	"reasoning",
	"reasoning_effort",
	"web_search_options",
	"verbosity",])

/**
 * Default parameters for this model
 */
export class DefaultParameters extends S.Class<DefaultParameters>("DefaultParameters")({
	temperature: S.optional(S.NullOr(S.Number.check(S.isGreaterThanOrEqualTo(0), S.isLessThanOrEqualTo(2)))),
	top_p: S.optional(S.NullOr(S.Number.check(S.isGreaterThanOrEqualTo(0), S.isLessThanOrEqualTo(1)))),
	frequency_penalty: S.optional(S.NullOr(S.Number.check(S.isGreaterThanOrEqualTo(-2), S.isLessThanOrEqualTo(2)))),
}) {}

/**
 * Information about an AI model available on OpenRouter
 */
export class Model extends S.Class<Model>("Model")({
	/**
	 * Unique identifier for the model
	 */
	id: S.String,
	/**
	 * Canonical slug for the model
	 */
	canonical_slug: S.String,
	/**
	 * Hugging Face model identifier, if applicable
	 */
	hugging_face_id: S.optional(S.NullOr(S.String)),
	/**
	 * Display name of the model
	 */
	name: S.String,
	/**
	 * Unix timestamp of when the model was created
	 */
	created: S.Number,
	/**
	 * Description of the model
	 */
	description: S.optional(S.NullOr(S.String)),
	pricing: PublicPricing,
	/**
	 * Maximum context length in tokens
	 */
	context_length: S.NullOr(S.Number),
	architecture: ModelArchitecture,
	top_provider: TopProviderInfo,
	per_request_limits: S.NullOr(PerRequestLimits),
	/**
	 * List of supported parameters for this model
	 */
	supported_parameters: S.Array(Parameter),
	default_parameters: S.NullOr(DefaultParameters),
	/**
	 * The date after which the model may be removed. ISO 8601 date string (YYYY-MM-DD) or null if no expiration.
	 */
	expiration_date: S.optional(S.NullOr(S.String)),
}) {}

/**
 * List of available models
 */
export const ModelsListResponseData = S.Array(Model)

/**
 * List of available models
 */
export class ModelsListResponse extends S.Class<ModelsListResponse>("ModelsListResponse")({
	data: ModelsListResponseData,
}) {}

export const GetGenerationParams = S.Struct({
	id: S.String.check(S.isMinLength(1)),
})

/**
 * Type of API used for the generation
 */
export const GetGeneration200DataApiType = S.Literals(["completions", "embeddings"])

/**
 * Generation response
 */
export const GetGeneration200 = S.Struct({
	/**
	 * Generation data
	 */
	data: S.Struct({
		/**
		 * Unique identifier for the generation
		 */
		id: S.String,
		/**
		 * Upstream provider's identifier for this generation
		 */
		upstream_id: S.NullOr(S.String),
		/**
		 * Total cost of the generation in USD
		 */
		total_cost: S.Number,
		/**
		 * Discount applied due to caching
		 */
		cache_discount: S.NullOr(S.Number),
		/**
		 * Cost charged by the upstream provider
		 */
		upstream_inference_cost: S.NullOr(S.Number),
		/**
		 * ISO 8601 timestamp of when the generation was created
		 */
		created_at: S.String,
		/**
		 * Model used for the generation
		 */
		model: S.String,
		/**
		 * ID of the app that made the request
		 */
		app_id: S.NullOr(S.Number),
		/**
		 * Whether the response was streamed
		 */
		streamed: S.NullOr(S.Boolean),
		/**
		 * Whether the generation was cancelled
		 */
		cancelled: S.NullOr(S.Boolean),
		/**
		 * Name of the provider that served the request
		 */
		provider_name: S.NullOr(S.String),
		/**
		 * Total latency in milliseconds
		 */
		latency: S.NullOr(S.Number),
		/**
		 * Moderation latency in milliseconds
		 */
		moderation_latency: S.NullOr(S.Number),
		/**
		 * Time taken for generation in milliseconds
		 */
		generation_time: S.NullOr(S.Number),
		/**
		 * Reason the generation finished
		 */
		finish_reason: S.NullOr(S.String),
		/**
		 * Number of tokens in the prompt
		 */
		tokens_prompt: S.NullOr(S.Number),
		/**
		 * Number of tokens in the completion
		 */
		tokens_completion: S.NullOr(S.Number),
		/**
		 * Native prompt tokens as reported by provider
		 */
		native_tokens_prompt: S.NullOr(S.Number),
		/**
		 * Native completion tokens as reported by provider
		 */
		native_tokens_completion: S.NullOr(S.Number),
		/**
		 * Native completion image tokens as reported by provider
		 */
		native_tokens_completion_images: S.NullOr(S.Number),
		/**
		 * Native reasoning tokens as reported by provider
		 */
		native_tokens_reasoning: S.NullOr(S.Number),
		/**
		 * Native cached tokens as reported by provider
		 */
		native_tokens_cached: S.NullOr(S.Number),
		/**
		 * Number of media items in the prompt
		 */
		num_media_prompt: S.NullOr(S.Number),
		/**
		 * Number of audio inputs in the prompt
		 */
		num_input_audio_prompt: S.NullOr(S.Number),
		/**
		 * Number of media items in the completion
		 */
		num_media_completion: S.NullOr(S.Number),
		/**
		 * Number of search results included
		 */
		num_search_results: S.NullOr(S.Number),
		/**
		 * Origin URL of the request
		 */
		origin: S.String,
		/**
		 * Usage amount in USD
		 */
		usage: S.Number,
		/**
		 * Whether this used bring-your-own-key
		 */
		is_byok: S.Boolean,
		/**
		 * Native finish reason as reported by provider
		 */
		native_finish_reason: S.NullOr(S.String),
		/**
		 * External user identifier
		 */
		external_user: S.NullOr(S.String),
		/**
		 * Type of API used for the generation
		 */
		api_type: S.NullOr(GetGeneration200DataApiType),
		/**
		 * Router used for the request (e.g., openrouter/auto)
		 */
		router: S.NullOr(S.String),
	}),
})

/**
 * Model count data
 */
export class ModelsCountResponse extends S.Class<ModelsCountResponse>("ModelsCountResponse")({
	/**
	 * Model count data
	 */
	data: S.Struct({
		/**
		 * Total number of available models
		 */
		count: S.Number,
	}),
}) {}

/**
 * Filter models by use case category
 */
export const GetModelsParamsCategory = S.Literals(["programming",
	"roleplay",
	"marketing",
	"marketing/seo",
	"technology",
	"science",
	"translation",
	"legal",
	"finance",
	"health",
	"trivia",
	"academia",])

export const GetModelsParams = S.Struct({
	/**
	 * Filter models by use case category
	 */
	category: S.optional(S.NullOr(GetModelsParamsCategory)),
	supported_parameters: S.optional(S.NullOr(S.String)),
})

/**
 * Instruction format type
 */
export const ListEndpointsResponseArchitectureEnumInstructType = S.Literals(["none",
	"airoboros",
	"alpaca",
	"alpaca-modif",
	"chatml",
	"claude",
	"code-llama",
	"gemma",
	"llama2",
	"llama3",
	"mistral",
	"nemotron",
	"neural",
	"openchat",
	"phi3",
	"rwkv",
	"vicuna",
	"zephyr",
	"deepseek-r1",
	"deepseek-v3.1",
	"qwq",
	"qwen3",])

/**
 * Model architecture information
 */
export const ListEndpointsResponseArchitecture = S.Struct({
	tokenizer: ModelGroup,
	/**
	 * Instruction format type
	 */
	instruct_type: S.NullOr(
		S.Literals([
			"none",
			"airoboros",
			"alpaca",
			"alpaca-modif",
			"chatml",
			"claude",
			"code-llama",
			"gemma",
			"llama2",
			"llama3",
			"mistral",
			"nemotron",
			"neural",
			"openchat",
			"phi3",
			"rwkv",
			"vicuna",
			"zephyr",
			"deepseek-r1",
			"deepseek-v3.1",
			"qwq",
			"qwen3",
		]),
	),
	/**
	 * Primary modality of the model
	 */
	modality: S.NullOr(S.String),
	/**
	 * Supported input modalities
	 */
	input_modalities: S.Array(InputModality),
	/**
	 * Supported output modalities
	 */
	output_modalities: S.Array(OutputModality),
})

export const PublicEndpointQuantizationEnum = S.Literals(["int4",
	"int8",
	"fp4",
	"fp6",
	"fp8",
	"fp16",
	"bf16",
	"fp32",
	"unknown",])

export const PublicEndpointQuantization = PublicEndpointQuantizationEnum

export const EndpointStatus = S.Literals([0, -1, -2, -3, -5, -10])

/**
 * Latency percentiles in milliseconds over the last 30 minutes. Latency measures time to first token. Only visible when authenticated with an API key or cookie; returns null for unauthenticated requests.
 */
export class PercentileStats extends S.Class<PercentileStats>("PercentileStats")({
	/**
	 * Median (50th percentile)
	 */
	p50: S.Number,
	/**
	 * 75th percentile
	 */
	p75: S.Number,
	/**
	 * 90th percentile
	 */
	p90: S.Number,
	/**
	 * 99th percentile
	 */
	p99: S.Number,
}) {}

/**
 * Throughput percentiles in tokens per second over the last 30 minutes. Throughput measures output token generation speed. Only visible when authenticated with an API key or cookie; returns null for unauthenticated requests.
 */
export const PublicEndpointThroughputLast30M = S.Struct({
	/**
	 * Median (50th percentile)
	 */
	p50: S.Number,
	/**
	 * 75th percentile
	 */
	p75: S.Number,
	/**
	 * 90th percentile
	 */
	p90: S.Number,
	/**
	 * 99th percentile
	 */
	p99: S.Number,
})

/**
 * Information about a specific model endpoint
 */
export class PublicEndpoint extends S.Class<PublicEndpoint>("PublicEndpoint")({
	name: S.String,
	/**
	 * The unique identifier for the model (permaslug)
	 */
	model_id: S.String,
	model_name: S.String,
	context_length: S.Number,
	pricing: S.Struct({
		prompt: BigNumberUnion,
		completion: BigNumberUnion,
		request: S.optional(S.NullOr(BigNumberUnion)),
		image: S.optional(S.NullOr(BigNumberUnion)),
		image_token: S.optional(S.NullOr(BigNumberUnion)),
		image_output: S.optional(S.NullOr(BigNumberUnion)),
		audio: S.optional(S.NullOr(BigNumberUnion)),
		audio_output: S.optional(S.NullOr(BigNumberUnion)),
		input_audio_cache: S.optional(S.NullOr(BigNumberUnion)),
		web_search: S.optional(S.NullOr(BigNumberUnion)),
		internal_reasoning: S.optional(S.NullOr(BigNumberUnion)),
		input_cache_read: S.optional(S.NullOr(BigNumberUnion)),
		input_cache_write: S.optional(S.NullOr(BigNumberUnion)),
		discount: S.optional(S.NullOr(S.Number)),
	}),
	provider_name: ProviderName,
	tag: S.String,
	quantization: PublicEndpointQuantization,
	max_completion_tokens: S.NullOr(S.Number),
	max_prompt_tokens: S.NullOr(S.Number),
	supported_parameters: S.Array(Parameter),
	status: S.optional(S.NullOr(EndpointStatus)),
	uptime_last_30m: S.NullOr(S.Number),
	supports_implicit_caching: S.Boolean,
	latency_last_30m: S.NullOr(PercentileStats),
	throughput_last_30m: PublicEndpointThroughputLast30M,
}) {}

/**
 * List of available endpoints for a model
 */
export class ListEndpointsResponse extends S.Class<ListEndpointsResponse>("ListEndpointsResponse")({
	/**
	 * Unique identifier for the model
	 */
	id: S.String,
	/**
	 * Display name of the model
	 */
	name: S.String,
	/**
	 * Unix timestamp of when the model was created
	 */
	created: S.Number,
	/**
	 * Description of the model
	 */
	description: S.String,
	architecture: ListEndpointsResponseArchitecture,
	/**
	 * List of available endpoints for this model
	 */
	endpoints: S.Array(PublicEndpoint),
}) {}

export const ListEndpoints200 = S.Struct({
	data: ListEndpointsResponse,
})

export const ListEndpointsZdr200 = S.Struct({
	data: S.Array(PublicEndpoint),
})

export const ListProviders200 = S.Struct({
	data: S.Array(
		S.Struct({
			/**
			 * Display name of the provider
			 */
			name: S.String,
			/**
			 * URL-friendly identifier for the provider
			 */
			slug: S.String,
			/**
			 * URL to the provider's privacy policy
			 */
			privacy_policy_url: S.NullOr(S.String),
			/**
			 * URL to the provider's terms of service
			 */
			terms_of_service_url: S.optional(S.NullOr(S.String)),
			/**
			 * URL to the provider's status page
			 */
			status_page_url: S.optional(S.NullOr(S.String)),
		}),
	),
})

export const ListParams = S.Struct({
	/**
	 * Whether to include disabled API keys in the response
	 */
	include_disabled: S.optional(S.NullOr(S.String)),
	/**
	 * Number of API keys to skip for pagination
	 */
	offset: S.optional(S.NullOr(S.String)),
})

export const List200 = S.Struct({
	/**
	 * List of API keys
	 */
	data: S.Array(
		S.Struct({
			/**
			 * Unique hash identifier for the API key
			 */
			hash: S.String,
			/**
			 * Name of the API key
			 */
			name: S.String,
			/**
			 * Human-readable label for the API key
			 */
			label: S.String,
			/**
			 * Whether the API key is disabled
			 */
			disabled: S.Boolean,
			/**
			 * Spending limit for the API key in USD
			 */
			limit: S.NullOr(S.Number),
			/**
			 * Remaining spending limit in USD
			 */
			limit_remaining: S.NullOr(S.Number),
			/**
			 * Type of limit reset for the API key
			 */
			limit_reset: S.NullOr(S.String),
			/**
			 * Whether to include external BYOK usage in the credit limit
			 */
			include_byok_in_limit: S.Boolean,
			/**
			 * Total OpenRouter credit usage (in USD) for the API key
			 */
			usage: S.Number,
			/**
			 * OpenRouter credit usage (in USD) for the current UTC day
			 */
			usage_daily: S.Number,
			/**
			 * OpenRouter credit usage (in USD) for the current UTC week (Monday-Sunday)
			 */
			usage_weekly: S.Number,
			/**
			 * OpenRouter credit usage (in USD) for the current UTC month
			 */
			usage_monthly: S.Number,
			/**
			 * Total external BYOK usage (in USD) for the API key
			 */
			byok_usage: S.Number,
			/**
			 * External BYOK usage (in USD) for the current UTC day
			 */
			byok_usage_daily: S.Number,
			/**
			 * External BYOK usage (in USD) for the current UTC week (Monday-Sunday)
			 */
			byok_usage_weekly: S.Number,
			/**
			 * External BYOK usage (in USD) for current UTC month
			 */
			byok_usage_monthly: S.Number,
			/**
			 * ISO 8601 timestamp of when the API key was created
			 */
			created_at: S.String,
			/**
			 * ISO 8601 timestamp of when the API key was last updated
			 */
			updated_at: S.NullOr(S.String),
			/**
			 * ISO 8601 UTC timestamp when the API key expires, or null if no expiration
			 */
			expires_at: S.optional(S.NullOr(S.String)),
		}),
	),
})

/**
 * Type of limit reset for the API key (daily, weekly, monthly, or null for no reset). Resets happen automatically at midnight UTC, and weeks are Monday through Sunday.
 */
export const CreateKeysRequestLimitReset = S.Literals(["daily", "weekly", "monthly"])

export class CreateKeysRequest extends S.Class<CreateKeysRequest>("CreateKeysRequest")({
	/**
	 * Name for the new API key
	 */
	name: S.String.check(S.isMinLength(1)),
	/**
	 * Optional spending limit for the API key in USD
	 */
	limit: S.optional(S.NullOr(S.Number)),
	/**
	 * Type of limit reset for the API key (daily, weekly, monthly, or null for no reset). Resets happen automatically at midnight UTC, and weeks are Monday through Sunday.
	 */
	limit_reset: S.optional(S.NullOr(CreateKeysRequestLimitReset)),
	/**
	 * Whether to include BYOK usage in the limit
	 */
	include_byok_in_limit: S.optional(S.NullOr(S.Boolean)),
	/**
	 * Optional ISO 8601 UTC timestamp when the API key should expire. Must be UTC, other timezones will be rejected
	 */
	expires_at: S.optional(S.NullOr(S.String)),
}) {}

export const CreateKeys201 = S.Struct({
	/**
	 * The created API key information
	 */
	data: S.Struct({
		/**
		 * Unique hash identifier for the API key
		 */
		hash: S.String,
		/**
		 * Name of the API key
		 */
		name: S.String,
		/**
		 * Human-readable label for the API key
		 */
		label: S.String,
		/**
		 * Whether the API key is disabled
		 */
		disabled: S.Boolean,
		/**
		 * Spending limit for the API key in USD
		 */
		limit: S.NullOr(S.Number),
		/**
		 * Remaining spending limit in USD
		 */
		limit_remaining: S.NullOr(S.Number),
		/**
		 * Type of limit reset for the API key
		 */
		limit_reset: S.NullOr(S.String),
		/**
		 * Whether to include external BYOK usage in the credit limit
		 */
		include_byok_in_limit: S.Boolean,
		/**
		 * Total OpenRouter credit usage (in USD) for the API key
		 */
		usage: S.Number,
		/**
		 * OpenRouter credit usage (in USD) for the current UTC day
		 */
		usage_daily: S.Number,
		/**
		 * OpenRouter credit usage (in USD) for the current UTC week (Monday-Sunday)
		 */
		usage_weekly: S.Number,
		/**
		 * OpenRouter credit usage (in USD) for the current UTC month
		 */
		usage_monthly: S.Number,
		/**
		 * Total external BYOK usage (in USD) for the API key
		 */
		byok_usage: S.Number,
		/**
		 * External BYOK usage (in USD) for the current UTC day
		 */
		byok_usage_daily: S.Number,
		/**
		 * External BYOK usage (in USD) for the current UTC week (Monday-Sunday)
		 */
		byok_usage_weekly: S.Number,
		/**
		 * External BYOK usage (in USD) for current UTC month
		 */
		byok_usage_monthly: S.Number,
		/**
		 * ISO 8601 timestamp of when the API key was created
		 */
		created_at: S.String,
		/**
		 * ISO 8601 timestamp of when the API key was last updated
		 */
		updated_at: S.NullOr(S.String),
		/**
		 * ISO 8601 UTC timestamp when the API key expires, or null if no expiration
		 */
		expires_at: S.optional(S.NullOr(S.String)),
	}),
	/**
	 * The actual API key string (only shown once)
	 */
	key: S.String,
})

export const GetKey200 = S.Struct({
	/**
	 * The API key information
	 */
	data: S.Struct({
		/**
		 * Unique hash identifier for the API key
		 */
		hash: S.String,
		/**
		 * Name of the API key
		 */
		name: S.String,
		/**
		 * Human-readable label for the API key
		 */
		label: S.String,
		/**
		 * Whether the API key is disabled
		 */
		disabled: S.Boolean,
		/**
		 * Spending limit for the API key in USD
		 */
		limit: S.NullOr(S.Number),
		/**
		 * Remaining spending limit in USD
		 */
		limit_remaining: S.NullOr(S.Number),
		/**
		 * Type of limit reset for the API key
		 */
		limit_reset: S.NullOr(S.String),
		/**
		 * Whether to include external BYOK usage in the credit limit
		 */
		include_byok_in_limit: S.Boolean,
		/**
		 * Total OpenRouter credit usage (in USD) for the API key
		 */
		usage: S.Number,
		/**
		 * OpenRouter credit usage (in USD) for the current UTC day
		 */
		usage_daily: S.Number,
		/**
		 * OpenRouter credit usage (in USD) for the current UTC week (Monday-Sunday)
		 */
		usage_weekly: S.Number,
		/**
		 * OpenRouter credit usage (in USD) for the current UTC month
		 */
		usage_monthly: S.Number,
		/**
		 * Total external BYOK usage (in USD) for the API key
		 */
		byok_usage: S.Number,
		/**
		 * External BYOK usage (in USD) for the current UTC day
		 */
		byok_usage_daily: S.Number,
		/**
		 * External BYOK usage (in USD) for the current UTC week (Monday-Sunday)
		 */
		byok_usage_weekly: S.Number,
		/**
		 * External BYOK usage (in USD) for current UTC month
		 */
		byok_usage_monthly: S.Number,
		/**
		 * ISO 8601 timestamp of when the API key was created
		 */
		created_at: S.String,
		/**
		 * ISO 8601 timestamp of when the API key was last updated
		 */
		updated_at: S.NullOr(S.String),
		/**
		 * ISO 8601 UTC timestamp when the API key expires, or null if no expiration
		 */
		expires_at: S.optional(S.NullOr(S.String)),
	}),
})

export const DeleteKeys200 = S.Struct({
	/**
	 * Confirmation that the API key was deleted
	 */
	deleted: S.Literal(true),
})

/**
 * New limit reset type for the API key (daily, weekly, monthly, or null for no reset). Resets happen automatically at midnight UTC, and weeks are Monday through Sunday.
 */
export const UpdateKeysRequestLimitReset = S.Literals(["daily", "weekly", "monthly"])

export class UpdateKeysRequest extends S.Class<UpdateKeysRequest>("UpdateKeysRequest")({
	/**
	 * New name for the API key
	 */
	name: S.optional(S.NullOr(S.String)),
	/**
	 * Whether to disable the API key
	 */
	disabled: S.optional(S.NullOr(S.Boolean)),
	/**
	 * New spending limit for the API key in USD
	 */
	limit: S.optional(S.NullOr(S.Number)),
	/**
	 * New limit reset type for the API key (daily, weekly, monthly, or null for no reset). Resets happen automatically at midnight UTC, and weeks are Monday through Sunday.
	 */
	limit_reset: S.optional(S.NullOr(UpdateKeysRequestLimitReset)),
	/**
	 * Whether to include BYOK usage in the limit
	 */
	include_byok_in_limit: S.optional(S.NullOr(S.Boolean)),
}) {}

export const UpdateKeys200 = S.Struct({
	/**
	 * The updated API key information
	 */
	data: S.Struct({
		/**
		 * Unique hash identifier for the API key
		 */
		hash: S.String,
		/**
		 * Name of the API key
		 */
		name: S.String,
		/**
		 * Human-readable label for the API key
		 */
		label: S.String,
		/**
		 * Whether the API key is disabled
		 */
		disabled: S.Boolean,
		/**
		 * Spending limit for the API key in USD
		 */
		limit: S.NullOr(S.Number),
		/**
		 * Remaining spending limit in USD
		 */
		limit_remaining: S.NullOr(S.Number),
		/**
		 * Type of limit reset for the API key
		 */
		limit_reset: S.NullOr(S.String),
		/**
		 * Whether to include external BYOK usage in the credit limit
		 */
		include_byok_in_limit: S.Boolean,
		/**
		 * Total OpenRouter credit usage (in USD) for the API key
		 */
		usage: S.Number,
		/**
		 * OpenRouter credit usage (in USD) for the current UTC day
		 */
		usage_daily: S.Number,
		/**
		 * OpenRouter credit usage (in USD) for the current UTC week (Monday-Sunday)
		 */
		usage_weekly: S.Number,
		/**
		 * OpenRouter credit usage (in USD) for the current UTC month
		 */
		usage_monthly: S.Number,
		/**
		 * Total external BYOK usage (in USD) for the API key
		 */
		byok_usage: S.Number,
		/**
		 * External BYOK usage (in USD) for the current UTC day
		 */
		byok_usage_daily: S.Number,
		/**
		 * External BYOK usage (in USD) for the current UTC week (Monday-Sunday)
		 */
		byok_usage_weekly: S.Number,
		/**
		 * External BYOK usage (in USD) for current UTC month
		 */
		byok_usage_monthly: S.Number,
		/**
		 * ISO 8601 timestamp of when the API key was created
		 */
		created_at: S.String,
		/**
		 * ISO 8601 timestamp of when the API key was last updated
		 */
		updated_at: S.NullOr(S.String),
		/**
		 * ISO 8601 UTC timestamp when the API key expires, or null if no expiration
		 */
		expires_at: S.optional(S.NullOr(S.String)),
	}),
})

export const ListGuardrailsParams = S.Struct({
	/**
	 * Number of records to skip for pagination
	 */
	offset: S.optional(S.NullOr(S.String)),
	/**
	 * Maximum number of records to return (max 100)
	 */
	limit: S.optional(S.NullOr(S.String)),
})

export const ListGuardrails200 = S.Struct({
	/**
	 * List of guardrails
	 */
	data: S.Array(
		S.Struct({
			/**
			 * Unique identifier for the guardrail
			 */
			id: S.String,
			/**
			 * Name of the guardrail
			 */
			name: S.String,
			/**
			 * Description of the guardrail
			 */
			description: S.optional(S.NullOr(S.String)),
			/**
			 * Spending limit in USD
			 */
			limit_usd: S.optional(S.NullOr(S.Number.check(S.isGreaterThan(0)))),
			/**
			 * Interval at which the limit resets (daily, weekly, monthly)
			 */
			reset_interval: S.optional(S.NullOr(S.Literals(["daily", "weekly", "monthly"]))),
			/**
			 * List of allowed provider IDs
			 */
			allowed_providers: S.optional(S.NullOr(S.Array(S.String))),
			/**
			 * Array of model canonical_slugs (immutable identifiers)
			 */
			allowed_models: S.optional(S.NullOr(S.Array(S.String))),
			/**
			 * Whether to enforce zero data retention
			 */
			enforce_zdr: S.optional(S.NullOr(S.Boolean)),
			/**
			 * ISO 8601 timestamp of when the guardrail was created
			 */
			created_at: S.String,
			/**
			 * ISO 8601 timestamp of when the guardrail was last updated
			 */
			updated_at: S.optional(S.NullOr(S.String)),
		}),
	),
	/**
	 * Total number of guardrails
	 */
	total_count: S.Number,
})

/**
 * Interval at which the limit resets (daily, weekly, monthly)
 */
export const CreateGuardrailRequestResetInterval = S.Literals(["daily", "weekly", "monthly"])

export class CreateGuardrailRequest extends S.Class<CreateGuardrailRequest>("CreateGuardrailRequest")({
	/**
	 * Name for the new guardrail
	 */
	name: S.String.check(S.isMinLength(1), S.isMaxLength(200)),
	/**
	 * Description of the guardrail
	 */
	description: S.optional(S.NullOr(S.String.check(S.isMaxLength(1000)))),
	/**
	 * Spending limit in USD
	 */
	limit_usd: S.optional(S.NullOr(S.Number.check(S.isGreaterThan(0)))),
	/**
	 * Interval at which the limit resets (daily, weekly, monthly)
	 */
	reset_interval: S.optional(S.NullOr(CreateGuardrailRequestResetInterval)),
	/**
	 * List of allowed provider IDs
	 */
	allowed_providers: S.optional(S.NullOr(S.NonEmptyArray(S.String).check(S.isMinLength(1)))),
	/**
	 * Array of model identifiers (slug or canonical_slug accepted)
	 */
	allowed_models: S.optional(S.NullOr(S.NonEmptyArray(S.String).check(S.isMinLength(1)))),
	/**
	 * Whether to enforce zero data retention
	 */
	enforce_zdr: S.optional(S.NullOr(S.Boolean)),
}) {}

/**
 * Interval at which the limit resets (daily, weekly, monthly)
 */
export const CreateGuardrail201DataResetInterval = S.Literals(["daily", "weekly", "monthly"])

export const CreateGuardrail201 = S.Struct({
	/**
	 * The created guardrail
	 */
	data: S.Struct({
		/**
		 * Unique identifier for the guardrail
		 */
		id: S.String,
		/**
		 * Name of the guardrail
		 */
		name: S.String,
		/**
		 * Description of the guardrail
		 */
		description: S.optional(S.NullOr(S.String)),
		/**
		 * Spending limit in USD
		 */
		limit_usd: S.optional(S.NullOr(S.Number.check(S.isGreaterThan(0)))),
		/**
		 * Interval at which the limit resets (daily, weekly, monthly)
		 */
		reset_interval: S.optional(S.NullOr(CreateGuardrail201DataResetInterval)),
		/**
		 * List of allowed provider IDs
		 */
		allowed_providers: S.optional(S.NullOr(S.Array(S.String))),
		/**
		 * Array of model canonical_slugs (immutable identifiers)
		 */
		allowed_models: S.optional(S.NullOr(S.Array(S.String))),
		/**
		 * Whether to enforce zero data retention
		 */
		enforce_zdr: S.optional(S.NullOr(S.Boolean)),
		/**
		 * ISO 8601 timestamp of when the guardrail was created
		 */
		created_at: S.String,
		/**
		 * ISO 8601 timestamp of when the guardrail was last updated
		 */
		updated_at: S.optional(S.NullOr(S.String)),
	}),
})

/**
 * Interval at which the limit resets (daily, weekly, monthly)
 */
export const GetGuardrail200DataResetInterval = S.Literals(["daily", "weekly", "monthly"])

export const GetGuardrail200 = S.Struct({
	/**
	 * The guardrail
	 */
	data: S.Struct({
		/**
		 * Unique identifier for the guardrail
		 */
		id: S.String,
		/**
		 * Name of the guardrail
		 */
		name: S.String,
		/**
		 * Description of the guardrail
		 */
		description: S.optional(S.NullOr(S.String)),
		/**
		 * Spending limit in USD
		 */
		limit_usd: S.optional(S.NullOr(S.Number.check(S.isGreaterThan(0)))),
		/**
		 * Interval at which the limit resets (daily, weekly, monthly)
		 */
		reset_interval: S.optional(S.NullOr(GetGuardrail200DataResetInterval)),
		/**
		 * List of allowed provider IDs
		 */
		allowed_providers: S.optional(S.NullOr(S.Array(S.String))),
		/**
		 * Array of model canonical_slugs (immutable identifiers)
		 */
		allowed_models: S.optional(S.NullOr(S.Array(S.String))),
		/**
		 * Whether to enforce zero data retention
		 */
		enforce_zdr: S.optional(S.NullOr(S.Boolean)),
		/**
		 * ISO 8601 timestamp of when the guardrail was created
		 */
		created_at: S.String,
		/**
		 * ISO 8601 timestamp of when the guardrail was last updated
		 */
		updated_at: S.optional(S.NullOr(S.String)),
	}),
})

export const DeleteGuardrail200 = S.Struct({
	/**
	 * Confirmation that the guardrail was deleted
	 */
	deleted: S.Literal(true),
})

/**
 * Interval at which the limit resets (daily, weekly, monthly)
 */
export const UpdateGuardrailRequestResetInterval = S.Literals(["daily", "weekly", "monthly"])

export class UpdateGuardrailRequest extends S.Class<UpdateGuardrailRequest>("UpdateGuardrailRequest")({
	/**
	 * New name for the guardrail
	 */
	name: S.optional(S.NullOr(S.String.check(S.isMinLength(1), S.isMaxLength(200)))),
	/**
	 * New description for the guardrail
	 */
	description: S.optional(S.NullOr(S.String.check(S.isMaxLength(1000)))),
	/**
	 * New spending limit in USD
	 */
	limit_usd: S.optional(S.NullOr(S.Number.check(S.isGreaterThan(0)))),
	/**
	 * Interval at which the limit resets (daily, weekly, monthly)
	 */
	reset_interval: S.optional(S.NullOr(UpdateGuardrailRequestResetInterval)),
	/**
	 * New list of allowed provider IDs
	 */
	allowed_providers: S.optional(S.NullOr(S.NonEmptyArray(S.String).check(S.isMinLength(1)))),
	/**
	 * Array of model identifiers (slug or canonical_slug accepted)
	 */
	allowed_models: S.optional(S.NullOr(S.NonEmptyArray(S.String).check(S.isMinLength(1)))),
	/**
	 * Whether to enforce zero data retention
	 */
	enforce_zdr: S.optional(S.NullOr(S.Boolean)),
}) {}

/**
 * Interval at which the limit resets (daily, weekly, monthly)
 */
export const UpdateGuardrail200DataResetInterval = S.Literals(["daily", "weekly", "monthly"])

export const UpdateGuardrail200 = S.Struct({
	/**
	 * The updated guardrail
	 */
	data: S.Struct({
		/**
		 * Unique identifier for the guardrail
		 */
		id: S.String,
		/**
		 * Name of the guardrail
		 */
		name: S.String,
		/**
		 * Description of the guardrail
		 */
		description: S.optional(S.NullOr(S.String)),
		/**
		 * Spending limit in USD
		 */
		limit_usd: S.optional(S.NullOr(S.Number.check(S.isGreaterThan(0)))),
		/**
		 * Interval at which the limit resets (daily, weekly, monthly)
		 */
		reset_interval: S.optional(S.NullOr(UpdateGuardrail200DataResetInterval)),
		/**
		 * List of allowed provider IDs
		 */
		allowed_providers: S.optional(S.NullOr(S.Array(S.String))),
		/**
		 * Array of model canonical_slugs (immutable identifiers)
		 */
		allowed_models: S.optional(S.NullOr(S.Array(S.String))),
		/**
		 * Whether to enforce zero data retention
		 */
		enforce_zdr: S.optional(S.NullOr(S.Boolean)),
		/**
		 * ISO 8601 timestamp of when the guardrail was created
		 */
		created_at: S.String,
		/**
		 * ISO 8601 timestamp of when the guardrail was last updated
		 */
		updated_at: S.optional(S.NullOr(S.String)),
	}),
})

export const ListKeyAssignmentsParams = S.Struct({
	/**
	 * Number of records to skip for pagination
	 */
	offset: S.optional(S.NullOr(S.String)),
	/**
	 * Maximum number of records to return (max 100)
	 */
	limit: S.optional(S.NullOr(S.String)),
})

export const ListKeyAssignments200 = S.Struct({
	/**
	 * List of key assignments
	 */
	data: S.Array(
		S.Struct({
			/**
			 * Unique identifier for the assignment
			 */
			id: S.String,
			/**
			 * Hash of the assigned API key
			 */
			key_hash: S.String,
			/**
			 * ID of the guardrail
			 */
			guardrail_id: S.String,
			/**
			 * Name of the API key
			 */
			key_name: S.String,
			/**
			 * Label of the API key
			 */
			key_label: S.String,
			/**
			 * User ID of who made the assignment
			 */
			assigned_by: S.NullOr(S.String),
			/**
			 * ISO 8601 timestamp of when the assignment was created
			 */
			created_at: S.String,
		}),
	),
	/**
	 * Total number of key assignments for this guardrail
	 */
	total_count: S.Number,
})

export const ListMemberAssignmentsParams = S.Struct({
	/**
	 * Number of records to skip for pagination
	 */
	offset: S.optional(S.NullOr(S.String)),
	/**
	 * Maximum number of records to return (max 100)
	 */
	limit: S.optional(S.NullOr(S.String)),
})

export const ListMemberAssignments200 = S.Struct({
	/**
	 * List of member assignments
	 */
	data: S.Array(
		S.Struct({
			/**
			 * Unique identifier for the assignment
			 */
			id: S.String,
			/**
			 * Clerk user ID of the assigned member
			 */
			user_id: S.String,
			/**
			 * Organization ID
			 */
			organization_id: S.String,
			/**
			 * ID of the guardrail
			 */
			guardrail_id: S.String,
			/**
			 * User ID of who made the assignment
			 */
			assigned_by: S.NullOr(S.String),
			/**
			 * ISO 8601 timestamp of when the assignment was created
			 */
			created_at: S.String,
		}),
	),
	/**
	 * Total number of member assignments
	 */
	total_count: S.Number,
})

export const ListGuardrailKeyAssignmentsParams = S.Struct({
	/**
	 * Number of records to skip for pagination
	 */
	offset: S.optional(S.NullOr(S.String)),
	/**
	 * Maximum number of records to return (max 100)
	 */
	limit: S.optional(S.NullOr(S.String)),
})

export const ListGuardrailKeyAssignments200 = S.Struct({
	/**
	 * List of key assignments
	 */
	data: S.Array(
		S.Struct({
			/**
			 * Unique identifier for the assignment
			 */
			id: S.String,
			/**
			 * Hash of the assigned API key
			 */
			key_hash: S.String,
			/**
			 * ID of the guardrail
			 */
			guardrail_id: S.String,
			/**
			 * Name of the API key
			 */
			key_name: S.String,
			/**
			 * Label of the API key
			 */
			key_label: S.String,
			/**
			 * User ID of who made the assignment
			 */
			assigned_by: S.NullOr(S.String),
			/**
			 * ISO 8601 timestamp of when the assignment was created
			 */
			created_at: S.String,
		}),
	),
	/**
	 * Total number of key assignments for this guardrail
	 */
	total_count: S.Number,
})

export class BulkAssignKeysToGuardrailRequest extends S.Class<BulkAssignKeysToGuardrailRequest>(
	"BulkAssignKeysToGuardrailRequest",
)({
	/**
	 * Array of API key hashes to assign to the guardrail
	 */
	key_hashes: S.NonEmptyArray(S.String.check(S.isMinLength(1))).check(S.isMinLength(1)),
}) {}

export const BulkAssignKeysToGuardrail200 = S.Struct({
	/**
	 * Number of keys successfully assigned
	 */
	assigned_count: S.Number,
})

export const ListGuardrailMemberAssignmentsParams = S.Struct({
	/**
	 * Number of records to skip for pagination
	 */
	offset: S.optional(S.NullOr(S.String)),
	/**
	 * Maximum number of records to return (max 100)
	 */
	limit: S.optional(S.NullOr(S.String)),
})

export const ListGuardrailMemberAssignments200 = S.Struct({
	/**
	 * List of member assignments
	 */
	data: S.Array(
		S.Struct({
			/**
			 * Unique identifier for the assignment
			 */
			id: S.String,
			/**
			 * Clerk user ID of the assigned member
			 */
			user_id: S.String,
			/**
			 * Organization ID
			 */
			organization_id: S.String,
			/**
			 * ID of the guardrail
			 */
			guardrail_id: S.String,
			/**
			 * User ID of who made the assignment
			 */
			assigned_by: S.NullOr(S.String),
			/**
			 * ISO 8601 timestamp of when the assignment was created
			 */
			created_at: S.String,
		}),
	),
	/**
	 * Total number of member assignments
	 */
	total_count: S.Number,
})

export class BulkAssignMembersToGuardrailRequest extends S.Class<BulkAssignMembersToGuardrailRequest>(
	"BulkAssignMembersToGuardrailRequest",
)({
	/**
	 * Array of member user IDs to assign to the guardrail
	 */
	member_user_ids: S.NonEmptyArray(S.String.check(S.isMinLength(1))).check(S.isMinLength(1)),
}) {}

export const BulkAssignMembersToGuardrail200 = S.Struct({
	/**
	 * Number of members successfully assigned
	 */
	assigned_count: S.Number,
})

export class BulkUnassignKeysFromGuardrailRequest extends S.Class<BulkUnassignKeysFromGuardrailRequest>(
	"BulkUnassignKeysFromGuardrailRequest",
)({
	/**
	 * Array of API key hashes to unassign from the guardrail
	 */
	key_hashes: S.NonEmptyArray(S.String.check(S.isMinLength(1))).check(S.isMinLength(1)),
}) {}

export const BulkUnassignKeysFromGuardrail200 = S.Struct({
	/**
	 * Number of keys successfully unassigned
	 */
	unassigned_count: S.Number,
})

export class BulkUnassignMembersFromGuardrailRequest extends S.Class<BulkUnassignMembersFromGuardrailRequest>(
	"BulkUnassignMembersFromGuardrailRequest",
)({
	/**
	 * Array of member user IDs to unassign from the guardrail
	 */
	member_user_ids: S.NonEmptyArray(S.String.check(S.isMinLength(1))).check(S.isMinLength(1)),
}) {}

export const BulkUnassignMembersFromGuardrail200 = S.Struct({
	/**
	 * Number of members successfully unassigned
	 */
	unassigned_count: S.Number,
})

export const GetCurrentKey200 = S.Struct({
	/**
	 * Current API key information
	 */
	data: S.Struct({
		/**
		 * Human-readable label for the API key
		 */
		label: S.String,
		/**
		 * Spending limit for the API key in USD
		 */
		limit: S.NullOr(S.Number),
		/**
		 * Total OpenRouter credit usage (in USD) for the API key
		 */
		usage: S.Number,
		/**
		 * OpenRouter credit usage (in USD) for the current UTC day
		 */
		usage_daily: S.Number,
		/**
		 * OpenRouter credit usage (in USD) for the current UTC week (Monday-Sunday)
		 */
		usage_weekly: S.Number,
		/**
		 * OpenRouter credit usage (in USD) for the current UTC month
		 */
		usage_monthly: S.Number,
		/**
		 * Total external BYOK usage (in USD) for the API key
		 */
		byok_usage: S.Number,
		/**
		 * External BYOK usage (in USD) for the current UTC day
		 */
		byok_usage_daily: S.Number,
		/**
		 * External BYOK usage (in USD) for the current UTC week (Monday-Sunday)
		 */
		byok_usage_weekly: S.Number,
		/**
		 * External BYOK usage (in USD) for current UTC month
		 */
		byok_usage_monthly: S.Number,
		/**
		 * Whether this is a free tier API key
		 */
		is_free_tier: S.Boolean,
		/**
		 * Whether this is a provisioning key
		 */
		is_provisioning_key: S.Boolean,
		/**
		 * Remaining spending limit in USD
		 */
		limit_remaining: S.NullOr(S.Number),
		/**
		 * Type of limit reset for the API key
		 */
		limit_reset: S.NullOr(S.String),
		/**
		 * Whether to include external BYOK usage in the credit limit
		 */
		include_byok_in_limit: S.Boolean,
		/**
		 * ISO 8601 UTC timestamp when the API key expires, or null if no expiration
		 */
		expires_at: S.optional(S.NullOr(S.String)),
		/**
		 * Legacy rate limit information about a key. Will always return -1.
		 */
		rate_limit: S.Struct({
			/**
			 * Number of requests allowed per interval
			 */
			requests: S.Number,
			/**
			 * Rate limit interval
			 */
			interval: S.String,
			/**
			 * Note about the rate limit
			 */
			note: S.String,
		}),
	}),
})

/**
 * The method used to generate the code challenge
 */
export const ExchangeAuthCodeForAPIKeyRequestCodeChallengeMethod = S.Literals(["S256", "plain"])

export class ExchangeAuthCodeForAPIKeyRequest extends S.Class<ExchangeAuthCodeForAPIKeyRequest>(
	"ExchangeAuthCodeForAPIKeyRequest",
)({
	/**
	 * The authorization code received from the OAuth redirect
	 */
	code: S.String,
	/**
	 * The code verifier if code_challenge was used in the authorization request
	 */
	code_verifier: S.optional(S.NullOr(S.String)),
	/**
	 * The method used to generate the code challenge
	 */
	code_challenge_method: S.optional(S.NullOr(ExchangeAuthCodeForAPIKeyRequestCodeChallengeMethod)),
}) {}

export const ExchangeAuthCodeForAPIKey200 = S.Struct({
	/**
	 * The API key to use for OpenRouter requests
	 */
	key: S.String,
	/**
	 * User ID associated with the API key
	 */
	user_id: S.NullOr(S.String),
})

/**
 * The method used to generate the code challenge
 */
export const CreateAuthKeysCodeRequestCodeChallengeMethod = S.Literals(["S256", "plain"])

export class CreateAuthKeysCodeRequest extends S.Class<CreateAuthKeysCodeRequest>(
	"CreateAuthKeysCodeRequest",
)({
	/**
	 * The callback URL to redirect to after authorization. Note, only https URLs on ports 443 and 3000 are allowed.
	 */
	callback_url: S.String,
	/**
	 * PKCE code challenge for enhanced security
	 */
	code_challenge: S.optional(S.NullOr(S.String)),
	/**
	 * The method used to generate the code challenge
	 */
	code_challenge_method: S.optional(S.NullOr(CreateAuthKeysCodeRequestCodeChallengeMethod)),
	/**
	 * Credit limit for the API key to be created
	 */
	limit: S.optional(S.NullOr(S.Number)),
	/**
	 * Optional expiration time for the API key to be created
	 */
	expires_at: S.optional(S.NullOr(S.String)),
}) {}

export const CreateAuthKeysCode200 = S.Struct({
	/**
	 * Auth code data
	 */
	data: S.Struct({
		/**
		 * The authorization code ID to use in the exchange request
		 */
		id: S.String,
		/**
		 * The application ID associated with this auth code
		 */
		app_id: S.Number,
		/**
		 * ISO 8601 timestamp of when the auth code was created
		 */
		created_at: S.String,
	}),
})

export const ChatGenerationParamsProviderEnumDataCollectionEnum = S.Literals(["deny", "allow"])

export const Schema0 = S.Array(
	S.Union([
		S.Literals([
			"AI21",
			"AionLabs",
			"Alibaba",
			"Amazon Bedrock",
			"Amazon Nova",
			"Anthropic",
			"Arcee AI",
			"AtlasCloud",
			"Avian",
			"Azure",
			"BaseTen",
			"BytePlus",
			"Black Forest Labs",
			"Cerebras",
			"Chutes",
			"Cirrascale",
			"Clarifai",
			"Cloudflare",
			"Cohere",
			"Crusoe",
			"DeepInfra",
			"DeepSeek",
			"Featherless",
			"Fireworks",
			"Friendli",
			"GMICloud",
			"Google",
			"Google AI Studio",
			"Groq",
			"Hyperbolic",
			"Inception",
			"Inceptron",
			"InferenceNet",
			"Infermatic",
			"Inflection",
			"Liquid",
			"Mara",
			"Mancer 2",
			"Minimax",
			"ModelRun",
			"Mistral",
			"Modular",
			"Moonshot AI",
			"Morph",
			"NCompass",
			"Nebius",
			"NextBit",
			"Novita",
			"Nvidia",
			"OpenAI",
			"OpenInference",
			"Parasail",
			"Perplexity",
			"Phala",
			"Relace",
			"SambaNova",
			"Seed",
			"SiliconFlow",
			"Sourceful",
			"Stealth",
			"StreamLake",
			"Switchpoint",
			"Together",
			"Upstage",
			"Venice",
			"WandB",
			"Xiaomi",
			"xAI",
			"Z.AI",
			"FakeProvider",
		]),
		S.String,
	]),
)

export const ProviderSortUnion = S.Union([ProviderSort, ProviderSortConfig])

export const Schema1 = S.Union([S.Number, S.String, S.Number])

export const ChatGenerationParamsRouteEnum = S.Literals(["fallback", "sort"])

export const ChatMessageContentItemCacheControlTtl = S.Literals(["5m", "1h"])

export class ChatMessageContentItemCacheControl extends S.Class<ChatMessageContentItemCacheControl>(
	"ChatMessageContentItemCacheControl",
)({
	type: S.Literal("ephemeral"),
	ttl: S.optional(S.NullOr(ChatMessageContentItemCacheControlTtl)),
}) {}

export class ChatMessageContentItemText extends S.Class<ChatMessageContentItemText>(
	"ChatMessageContentItemText",
)({
	type: S.Literal("text"),
	text: S.String,
	cache_control: S.optional(S.NullOr(ChatMessageContentItemCacheControl)),
}) {}

export class SystemMessage extends S.Class<SystemMessage>("SystemMessage")({
	role: S.Literal("system"),
	content: S.Union([S.String, S.Array(ChatMessageContentItemText)]),
	name: S.optional(S.NullOr(S.String)),
}) {}

export const ChatMessageContentItemImageImageUrlDetail = S.Literals(["auto", "low", "high"])

export class ChatMessageContentItemImage extends S.Class<ChatMessageContentItemImage>(
	"ChatMessageContentItemImage",
)({
	type: S.Literal("image_url"),
	image_url: S.Struct({
		url: S.String,
		detail: S.optional(S.NullOr(ChatMessageContentItemImageImageUrlDetail)),
	}),
}) {}

export class ChatMessageContentItemAudio extends S.Class<ChatMessageContentItemAudio>(
	"ChatMessageContentItemAudio",
)({
	type: S.Literal("input_audio"),
	input_audio: S.Struct({
		data: S.String,
		format: S.String,
	}),
}) {}

export const ChatMessageContentItemVideo = S.Record(S.String, S.Unknown)

export const ChatMessageContentItem = S.Record(S.String, S.Unknown)

export class UserMessage extends S.Class<UserMessage>("UserMessage")({
	role: S.Literal("user"),
	content: S.Union([S.String, S.Array(ChatMessageContentItem)]),
	name: S.optional(S.NullOr(S.String)),
}) {}

export class ChatMessageToolCall extends S.Class<ChatMessageToolCall>("ChatMessageToolCall")({
	id: S.String,
	type: S.Literal("function"),
	function: S.Struct({
		name: S.String,
		arguments: S.String,
	}),
}) {}

export const Schema3 = S.Union([S.String, S.Null])

export const Schema4Enum = S.Literals(["unknown",
	"openai-responses-v1",
	"azure-openai-responses-v1",
	"xai-responses-v1",
	"anthropic-claude-v1",
	"google-gemini-v1",])

export const Schema4 = S.Union([Schema4Enum, S.Null])

export const Schema5 = S.Number

export const Schema2 = S.Record(S.String, S.Unknown)

export class AssistantMessage extends S.Class<AssistantMessage>("AssistantMessage")({
	role: S.Literal("assistant"),
	content: S.optional(S.NullOr(S.Union([S.String, S.Array(ChatMessageContentItem)]))),
	name: S.optional(S.NullOr(S.String)),
	tool_calls: S.optional(S.NullOr(S.Array(ChatMessageToolCall))),
	refusal: S.optional(S.NullOr(S.String)),
	reasoning: S.optional(S.NullOr(S.String)),
	reasoning_details: S.optional(S.NullOr(S.Array(ReasoningDetail))),
	images: S.optional(S.NullOr(S.Array(
			S.Struct({
				image_url: S.Struct({
					url: S.String,
				}),
			}),
		))),
	annotations: S.optional(S.NullOr(S.Array(AnnotationDetail))),
}) {}

export class ToolResponseMessage extends S.Class<ToolResponseMessage>("ToolResponseMessage")({
	role: S.Literal("tool"),
	content: S.Union([S.String, S.Array(ChatMessageContentItem)]),
	tool_call_id: S.String,
}) {}

export const Message = S.Record(S.String, S.Unknown)

export const ModelName = S.String

export const ChatGenerationParamsReasoningEffortEnum = S.Literals(["xhigh",
	"high",
	"medium",
	"low",
	"minimal",
	"none",])

export class JSONSchemaConfig extends S.Class<JSONSchemaConfig>("JSONSchemaConfig")({
	name: S.String.check(S.isMaxLength(64)),
	description: S.optional(S.NullOr(S.String)),
	schema: S.optional(S.NullOr(S.Record(S.String, S.Unknown))),
	strict: S.optional(S.NullOr(S.Boolean)),
}) {}

export class ResponseFormatJSONSchema extends S.Class<ResponseFormatJSONSchema>("ResponseFormatJSONSchema")({
	type: S.Literal("json_schema"),
	json_schema: JSONSchemaConfig,
}) {}

export class ResponseFormatTextGrammar extends S.Class<ResponseFormatTextGrammar>(
	"ResponseFormatTextGrammar",
)({
	type: S.Literal("grammar"),
	grammar: S.String,
}) {}

export class ChatStreamOptions extends S.Class<ChatStreamOptions>("ChatStreamOptions")({
	include_usage: S.optional(S.NullOr(S.Boolean)),
}) {}

export class NamedToolChoice extends S.Class<NamedToolChoice>("NamedToolChoice")({
	type: S.Literal("function"),
	function: S.Struct({
		name: S.String,
	}),
}) {}

export const ToolChoiceOption = S.Union([S.Literal("none"),
	S.Literal("auto"),
	S.Literal("required"),
	NamedToolChoice,])

export class ToolDefinitionJson extends S.Class<ToolDefinitionJson>("ToolDefinitionJson")({
	type: S.Literal("function"),
	function: S.Struct({
		name: S.String.check(S.isMaxLength(64)),
		description: S.optional(S.NullOr(S.String)),
		parameters: S.optional(S.NullOr(S.Record(S.String, S.Unknown))),
		strict: S.optional(S.NullOr(S.Boolean)),
	}),
}) {}

export class ChatGenerationParams extends S.Class<ChatGenerationParams>("ChatGenerationParams")({
	/**
	 * When multiple model providers are available, optionally indicate your routing preference.
	 */
	provider: S.optional(S.NullOr(S.Struct({
			/**
			 * Whether to allow backup providers to serve requests
			 * - true: (default) when the primary provider (or your custom providers in "order") is unavailable, use the next best provider.
			 * - false: use only the primary/custom provider, and return the upstream error if it's unavailable.
			 */
			allow_fallbacks: S.optional(S.NullOr(S.Boolean)),
			/**
			 * Whether to filter providers to only those that support the parameters you've provided. If this setting is omitted or set to false, then providers will receive only the parameters they support, and ignore the rest.
			 */
			require_parameters: S.optional(S.NullOr(S.Boolean)),
			/**
			 * Data collection setting. If no available model provider meets the requirement, your request will return an error.
			 * - allow: (default) allow providers which store user data non-transiently and may train on it
			 *
			 * - deny: use only providers which do not collect user data.
			 */
			data_collection: S.optional(S.NullOr(S.Literals(["deny", "allow"]))),
			zdr: S.optional(S.NullOr(S.Boolean)),
			enforce_distillable_text: S.optional(S.NullOr(S.Boolean)),
			/**
			 * An ordered list of provider slugs. The router will attempt to use the first provider in the subset of this list that supports your requested model, and fall back to the next if it is unavailable. If no providers are available, the request will fail with an error message.
			 */
			order: S.optional(S.NullOr(Schema0)),
			/**
			 * List of provider slugs to allow. If provided, this list is merged with your account-wide allowed provider settings for this request.
			 */
			only: S.optional(S.NullOr(Schema0)),
			/**
			 * List of provider slugs to ignore. If provided, this list is merged with your account-wide ignored provider settings for this request.
			 */
			ignore: S.optional(S.NullOr(Schema0)),
			/**
			 * A list of quantization levels to filter the provider by.
			 */
			quantizations: S.optional(S.Array(S.Literals(["int4", "int8", "fp4", "fp6", "fp8", "fp16", "bf16", "fp32", "unknown"]))),
			/**
			 * The sorting strategy to use for this request, if "order" is not specified. When set, no load balancing is performed.
			 */
			sort: S.optional(S.NullOr(ProviderSortUnion)),
			/**
			 * The object specifying the maximum price you want to pay for this request. USD price per million tokens, for prompt and completion.
			 */
			max_price: S.optional(S.Struct({
					prompt: S.optional(S.NullOr(Schema1)),
					completion: S.optional(S.NullOr(Schema1)),
					image: S.optional(S.NullOr(Schema1)),
					audio: S.optional(S.NullOr(Schema1)),
					request: S.optional(S.NullOr(Schema1)),
				})),
			/**
			 * Preferred minimum throughput (in tokens per second). Can be a number (applies to p50) or an object with percentile-specific cutoffs. Endpoints below the threshold(s) may still be used, but are deprioritized in routing. When using fallback models, this may cause a fallback model to be used instead of the primary model if it meets the threshold.
			 */
			preferred_min_throughput: S.optional(S.Union([
					S.Number,
					S.Struct({
						p50: S.optional(S.NullOr(S.Number)),
						p75: S.optional(S.NullOr(S.Number)),
						p90: S.optional(S.NullOr(S.Number)),
						p99: S.optional(S.NullOr(S.Number)),
					}),
				])),
			/**
			 * Preferred maximum latency (in seconds). Can be a number (applies to p50) or an object with percentile-specific cutoffs. Endpoints above the threshold(s) may still be used, but are deprioritized in routing. When using fallback models, this may cause a fallback model to be used instead of the primary model if it meets the threshold.
			 */
			preferred_max_latency: S.optional(S.Union([
					S.Number,
					S.Struct({
						p50: S.optional(S.NullOr(S.Number)),
						p75: S.optional(S.NullOr(S.Number)),
						p90: S.optional(S.NullOr(S.Number)),
						p99: S.optional(S.NullOr(S.Number)),
					}),
				])),
		}))),
	/**
	 * Plugins you want to enable for this request, including their settings.
	 */
	plugins: S.optional(S.NullOr(S.Array(S.Record(S.String, S.Unknown)))),
	route: S.optional(S.NullOr(ChatGenerationParamsRouteEnum)),
	user: S.optional(S.NullOr(S.String)),
	/**
	 * A unique identifier for grouping related requests (e.g., a conversation or agent workflow) for observability. If provided in both the request body and the x-session-id header, the body value takes precedence. Maximum of 128 characters.
	 */
	session_id: S.optional(S.NullOr(S.String.check(S.isMaxLength(128)))),
	messages: S.NonEmptyArray(Message).check(S.isMinLength(1)),
	model: S.optional(S.NullOr(ModelName)),
	models: S.optional(S.NullOr(S.Array(ModelName))),
	frequency_penalty: S.optional(S.NullOr(S.Number.check(S.isGreaterThanOrEqualTo(-2), S.isLessThanOrEqualTo(2)))),
	logit_bias: S.optional(S.NullOr(S.Record(S.String, S.Unknown))),
	logprobs: S.optional(S.NullOr(S.Boolean)),
	top_logprobs: S.optional(S.NullOr(S.Number.check(S.isGreaterThanOrEqualTo(0), S.isLessThanOrEqualTo(20)))),
	max_completion_tokens: S.optional(S.NullOr(S.Number.check(S.isGreaterThanOrEqualTo(1)))),
	max_tokens: S.optional(S.NullOr(S.Number.check(S.isGreaterThanOrEqualTo(1)))),
	metadata: S.optional(S.NullOr(S.Record(S.String, S.Unknown))),
	presence_penalty: S.optional(S.NullOr(S.Number.check(S.isGreaterThanOrEqualTo(-2), S.isLessThanOrEqualTo(2)))),
	reasoning: S.optional(S.NullOr(S.Struct({
			effort: S.optional(S.NullOr(ChatGenerationParamsReasoningEffortEnum)),
			summary: S.optional(S.NullOr(ReasoningSummaryVerbosity)),
		}))),
	response_format: S.optional(S.NullOr(S.Record(S.String, S.Unknown))),
	seed: S.optional(S.NullOr(S.Int.check(S.isGreaterThanOrEqualTo(-9007199254740991), S.isLessThanOrEqualTo(9007199254740991)))),
	stop: S.optional(S.NullOr(S.Union([S.String, S.Array(S.String).check(S.isMaxLength(4))]))),
	stream: S.NullOr(S.Boolean).pipe(S.optional, S.withDecodingDefault(() => false as const)),
	stream_options: S.optional(S.NullOr(ChatStreamOptions)),
	temperature: S.NullOr(S.Number.check(S.isGreaterThanOrEqualTo(0), S.isLessThanOrEqualTo(2))).pipe(S.optional, S.withDecodingDefault(() => 1 as const)),
	tool_choice: S.optional(S.NullOr(ToolChoiceOption)),
	tools: S.optional(S.NullOr(S.Array(ToolDefinitionJson))),
	top_p: S.NullOr(S.Number.check(S.isGreaterThanOrEqualTo(0), S.isLessThanOrEqualTo(1))).pipe(S.optional, S.withDecodingDefault(() => 1 as const)),
	debug: S.optional(S.NullOr(S.Struct({
			echo_upstream_body: S.optional(S.NullOr(S.Boolean)),
		}))),
	image_config: S.optional(S.NullOr(S.Record(S.String, S.Unknown))),
	modalities: S.optional(S.NullOr(S.Array(S.Literals(["text", "image"])))),
}) {}

export const ChatCompletionFinishReason = S.Literals(["tool_calls",
	"stop",
	"length",
	"content_filter",
	"error",])

export const Schema6 = S.Union([ChatCompletionFinishReason, S.Null])

export class ChatMessageTokenLogprob extends S.Class<ChatMessageTokenLogprob>("ChatMessageTokenLogprob")({
	token: S.String,
	logprob: S.Number,
	bytes: S.NullOr(S.Array(S.Number)),
	top_logprobs: S.Array(
		S.Struct({
			token: S.String,
			logprob: S.Number,
			bytes: S.NullOr(S.Array(S.Number)),
		}),
	),
}) {}

export class ChatMessageTokenLogprobs extends S.Class<ChatMessageTokenLogprobs>("ChatMessageTokenLogprobs")({
	content: S.optional(S.NullOr(S.Array(ChatMessageTokenLogprob))),
	refusal: S.optional(S.NullOr(S.Array(ChatMessageTokenLogprob))),
}) {}

export class ChatResponseChoice extends S.Class<ChatResponseChoice>("ChatResponseChoice")({
	finish_reason: S.NullOr(ChatCompletionFinishReason),
	index: S.Number,
	message: AssistantMessage,
	logprobs: S.optional(S.NullOr(ChatMessageTokenLogprobs)),
}) {}

export class ChatGenerationTokenUsage extends S.Class<ChatGenerationTokenUsage>("ChatGenerationTokenUsage")({
	completion_tokens: S.Number,
	prompt_tokens: S.Number,
	total_tokens: S.Number,
	completion_tokens_details: S.optional(S.NullOr(S.Struct({
			reasoning_tokens: S.optional(S.NullOr(S.Number)),
			audio_tokens: S.optional(S.NullOr(S.Number)),
			accepted_prediction_tokens: S.optional(S.NullOr(S.Number)),
			rejected_prediction_tokens: S.optional(S.NullOr(S.Number)),
		}))),
	prompt_tokens_details: S.optional(S.NullOr(S.Struct({
			cached_tokens: S.optional(S.NullOr(S.Number)),
			cache_write_tokens: S.optional(S.NullOr(S.Number)),
			audio_tokens: S.optional(S.NullOr(S.Number)),
			video_tokens: S.optional(S.NullOr(S.Number)),
		}))),
	cost: S.optional(S.NullOr(S.Number)),
	cost_details: S.optional(S.NullOr(S.Struct({ upstream_inference_cost: S.optional(S.NullOr(S.Number)) }))),
}) {}

export class ChatResponse extends S.Class<ChatResponse>("ChatResponse")({
	id: S.String,
	provider: S.optional(S.NullOr(S.String)),
	choices: S.Array(ChatResponseChoice),
	created: S.Number,
	model: S.String,
	object: S.Literal("chat.completion"),
	system_fingerprint: S.optional(S.NullOr(S.String)),
	usage: S.optional(S.NullOr(ChatGenerationTokenUsage)),
}) {}

export class ChatError extends S.Class<ChatError>("ChatError")({
	error: S.Struct({
		code: S.NullOr(S.Union([S.String, S.Number])),
		message: S.String,
		param: S.optional(S.NullOr(S.String)),
		type: S.optional(S.NullOr(S.String)),
	}),
}) {}

export class CompletionCreateParams extends S.Class<CompletionCreateParams>("CompletionCreateParams")({
	model: S.optional(S.NullOr(ModelName)),
	models: S.optional(S.NullOr(S.Array(ModelName))),
	prompt: S.Union([S.String, S.Array(S.String), S.Array(S.Number), S.Array(S.Array(S.Number))]),
	best_of: S.optional(S.NullOr(S.Int.check(S.isGreaterThanOrEqualTo(1), S.isLessThanOrEqualTo(20)))),
	echo: S.optional(S.NullOr(S.Boolean)),
	frequency_penalty: S.optional(S.NullOr(S.Number.check(S.isGreaterThanOrEqualTo(-2), S.isLessThanOrEqualTo(2)))),
	logit_bias: S.optional(S.NullOr(S.Record(S.String, S.Unknown))),
	logprobs: S.optional(S.NullOr(S.Int.check(S.isGreaterThanOrEqualTo(0), S.isLessThanOrEqualTo(5)))),
	max_tokens: S.optional(S.NullOr(S.Int.check(S.isGreaterThanOrEqualTo(1), S.isLessThanOrEqualTo(9007199254740991)))),
	n: S.optional(S.NullOr(S.Int.check(S.isGreaterThanOrEqualTo(1), S.isLessThanOrEqualTo(128)))),
	presence_penalty: S.optional(S.NullOr(S.Number.check(S.isGreaterThanOrEqualTo(-2), S.isLessThanOrEqualTo(2)))),
	seed: S.optional(S.NullOr(S.Int.check(S.isGreaterThanOrEqualTo(-9007199254740991), S.isLessThanOrEqualTo(9007199254740991)))),
	stop: S.optional(S.NullOr(S.Union([S.String, S.Array(S.String)]))),
	stream: S.NullOr(S.Boolean).pipe(S.optional, S.withDecodingDefault(() => false as const)),
	stream_options: S.optional(S.NullOr(S.Struct({
			include_usage: S.optional(S.NullOr(S.Boolean)),
		}))),
	suffix: S.optional(S.NullOr(S.String)),
	temperature: S.optional(S.NullOr(S.Number.check(S.isGreaterThanOrEqualTo(0), S.isLessThanOrEqualTo(2)))),
	top_p: S.optional(S.NullOr(S.Number.check(S.isGreaterThanOrEqualTo(0), S.isLessThanOrEqualTo(1)))),
	user: S.optional(S.NullOr(S.String)),
	metadata: S.optional(S.NullOr(S.Record(S.String, S.Unknown))),
	response_format: S.optional(S.NullOr(S.Record(S.String, S.Unknown))),
}) {}

export class CompletionLogprobs extends S.Class<CompletionLogprobs>("CompletionLogprobs")({
	tokens: S.Array(S.String),
	token_logprobs: S.Array(S.Number),
	top_logprobs: S.NullOr(S.Array(S.Record(S.String, S.Unknown))),
	text_offset: S.Array(S.Number),
}) {}

export const CompletionFinishReasonEnum = S.Literals(["stop", "length", "content_filter"])

export const CompletionFinishReason = S.Union([CompletionFinishReasonEnum, S.Null])

export class CompletionChoice extends S.Class<CompletionChoice>("CompletionChoice")({
	text: S.String,
	index: S.Number,
	logprobs: S.NullOr(CompletionLogprobs),
	finish_reason: S.NullOr(S.Literals(["stop", "length", "content_filter"])),
	native_finish_reason: S.optional(S.NullOr(S.String)),
	reasoning: S.optional(S.NullOr(S.String)),
}) {}

export class CompletionUsage extends S.Class<CompletionUsage>("CompletionUsage")({
	prompt_tokens: S.Number,
	completion_tokens: S.Number,
	total_tokens: S.Number,
}) {}

export class CompletionResponse extends S.Class<CompletionResponse>("CompletionResponse")({
	id: S.String,
	object: S.Literal("text_completion"),
	created: S.Number,
	model: S.String,
	provider: S.optional(S.NullOr(S.String)),
	system_fingerprint: S.optional(S.NullOr(S.String)),
	choices: S.Array(CompletionChoice),
	usage: S.optional(S.NullOr(CompletionUsage)),
}) {}

export const make = (
	httpClient: HttpClient.HttpClient,
	options: {
		readonly transformClient?:
			| ((client: HttpClient.HttpClient) => Effect.Effect<HttpClient.HttpClient>)
			| undefined
	} = {},
): Client => {
	const unexpectedStatus = (response: HttpClientResponse.HttpClientResponse) =>
		Effect.flatMap(
			Effect.orElseSucceed(response.json, () => "Unexpected status code"),
			(description) =>
				Effect.fail(
					new HttpClientError.StatusCodeError({
						request: response.request,
						response,
						description:
							typeof description === "string" ? description : JSON.stringify(description),
					}),
				),
		)
	const withResponse: (
		f: (response: HttpClientResponse.HttpClientResponse) => Effect.Effect<any, any, any>,
	) => (request: HttpClientRequest.HttpClientRequest) => Effect.Effect<any, any, any> = options.transformClient
		? (f) => (request) =>
				Effect.flatMap(
					Effect.flatMap(options.transformClient!(httpClient), (client) => client.execute(request)),
					f,
				)
		: (f) => (request) => Effect.flatMap(httpClient.execute(request), f)
	const decodeSuccess =
		(schema: S.Top) =>
		(response: HttpClientResponse.HttpClientResponse) =>
			HttpClientResponse.schemaBodyJson(schema)(response)
	const decodeError =
		<const Tag extends string>(tag: Tag, schema: S.Top) =>
		(response: HttpClientResponse.HttpClientResponse) =>
			Effect.flatMap(HttpClientResponse.schemaBodyJson(schema)(response), (cause: any) =>
				Effect.fail(ClientError(tag, cause, response)),
			)
	return ({
		httpClient,
		createResponses: (options: any) =>
			HttpClientRequest.post(`/responses`).pipe(
				HttpClientRequest.bodyJsonUnsafe(options),
				withResponse(
					HttpClientResponse.matchStatus({
						"2xx": decodeSuccess(OpenResponsesNonStreamingResponse),
						"400": decodeError("BadRequestResponse", BadRequestResponse),
						"401": decodeError("UnauthorizedResponse", UnauthorizedResponse),
						"402": decodeError("PaymentRequiredResponse", PaymentRequiredResponse),
						"404": decodeError("NotFoundResponse", NotFoundResponse),
						"408": decodeError("RequestTimeoutResponse", RequestTimeoutResponse),
						"413": decodeError("PayloadTooLargeResponse", PayloadTooLargeResponse),
						"422": decodeError("UnprocessableEntityResponse", UnprocessableEntityResponse),
						"429": decodeError("TooManyRequestsResponse", TooManyRequestsResponse),
						"500": decodeError("InternalServerResponse", InternalServerResponse),
						"502": decodeError("BadGatewayResponse", BadGatewayResponse),
						"503": decodeError("ServiceUnavailableResponse", ServiceUnavailableResponse),
						"524": decodeError("EdgeNetworkTimeoutResponse", EdgeNetworkTimeoutResponse),
						"529": decodeError("ProviderOverloadedResponse", ProviderOverloadedResponse),
						orElse: unexpectedStatus,
					}),
				),
			),
		createMessages: (options: any) =>
			HttpClientRequest.post(`/messages`).pipe(
				HttpClientRequest.bodyJsonUnsafe(options),
				withResponse(
					HttpClientResponse.matchStatus({
						"2xx": decodeSuccess(AnthropicMessagesResponse),
						"400": decodeError("CreateMessages400", CreateMessages400),
						"401": decodeError("CreateMessages401", CreateMessages401),
						"403": decodeError("CreateMessages403", CreateMessages403),
						"404": decodeError("CreateMessages404", CreateMessages404),
						"429": decodeError("CreateMessages429", CreateMessages429),
						"500": decodeError("CreateMessages500", CreateMessages500),
						"503": decodeError("CreateMessages503", CreateMessages503),
						"529": decodeError("CreateMessages529", CreateMessages529),
						orElse: unexpectedStatus,
					}),
				),
			),
		getUserActivity: (options: any) =>
			HttpClientRequest.get(`/activity`).pipe(
				HttpClientRequest.setUrlParams({ date: options?.["date"] as any }),
				withResponse(
					HttpClientResponse.matchStatus({
						"2xx": decodeSuccess(GetUserActivity200),
						"400": decodeError("BadRequestResponse", BadRequestResponse),
						"401": decodeError("UnauthorizedResponse", UnauthorizedResponse),
						"403": decodeError("ForbiddenResponse", ForbiddenResponse),
						"500": decodeError("InternalServerResponse", InternalServerResponse),
						orElse: unexpectedStatus,
					}),
				),
			),
		getCredits: () =>
			HttpClientRequest.get(`/credits`).pipe(
				withResponse(
					HttpClientResponse.matchStatus({
						"2xx": decodeSuccess(GetCredits200),
						"401": decodeError("UnauthorizedResponse", UnauthorizedResponse),
						"403": decodeError("ForbiddenResponse", ForbiddenResponse),
						"500": decodeError("InternalServerResponse", InternalServerResponse),
						orElse: unexpectedStatus,
					}),
				),
			),
		createCoinbaseCharge: (options: any) =>
			HttpClientRequest.post(`/credits/coinbase`).pipe(
				HttpClientRequest.bodyJsonUnsafe(options),
				withResponse(
					HttpClientResponse.matchStatus({
						"2xx": decodeSuccess(CreateCoinbaseCharge200),
						"400": decodeError("BadRequestResponse", BadRequestResponse),
						"401": decodeError("UnauthorizedResponse", UnauthorizedResponse),
						"429": decodeError("TooManyRequestsResponse", TooManyRequestsResponse),
						"500": decodeError("InternalServerResponse", InternalServerResponse),
						orElse: unexpectedStatus,
					}),
				),
			),
		createEmbeddings: (options: any) =>
			HttpClientRequest.post(`/embeddings`).pipe(
				HttpClientRequest.bodyJsonUnsafe(options),
				withResponse(
					HttpClientResponse.matchStatus({
						"2xx": decodeSuccess(CreateEmbeddings200),
						"400": decodeError("BadRequestResponse", BadRequestResponse),
						"401": decodeError("UnauthorizedResponse", UnauthorizedResponse),
						"402": decodeError("PaymentRequiredResponse", PaymentRequiredResponse),
						"404": decodeError("NotFoundResponse", NotFoundResponse),
						"429": decodeError("TooManyRequestsResponse", TooManyRequestsResponse),
						"500": decodeError("InternalServerResponse", InternalServerResponse),
						"502": decodeError("BadGatewayResponse", BadGatewayResponse),
						"503": decodeError("ServiceUnavailableResponse", ServiceUnavailableResponse),
						"524": decodeError("EdgeNetworkTimeoutResponse", EdgeNetworkTimeoutResponse),
						"529": decodeError("ProviderOverloadedResponse", ProviderOverloadedResponse),
						orElse: unexpectedStatus,
					}),
				),
			),
		listEmbeddingsModels: () =>
			HttpClientRequest.get(`/embeddings/models`).pipe(
				withResponse(
					HttpClientResponse.matchStatus({
						"2xx": decodeSuccess(ModelsListResponse),
						"400": decodeError("BadRequestResponse", BadRequestResponse),
						"500": decodeError("InternalServerResponse", InternalServerResponse),
						orElse: unexpectedStatus,
					}),
				),
			),
		getGeneration: (options: any) =>
			HttpClientRequest.get(`/generation`).pipe(
				HttpClientRequest.setUrlParams({ id: options?.["id"] as any }),
				withResponse(
					HttpClientResponse.matchStatus({
						"2xx": decodeSuccess(GetGeneration200),
						"401": decodeError("UnauthorizedResponse", UnauthorizedResponse),
						"402": decodeError("PaymentRequiredResponse", PaymentRequiredResponse),
						"404": decodeError("NotFoundResponse", NotFoundResponse),
						"429": decodeError("TooManyRequestsResponse", TooManyRequestsResponse),
						"500": decodeError("InternalServerResponse", InternalServerResponse),
						"502": decodeError("BadGatewayResponse", BadGatewayResponse),
						"524": decodeError("EdgeNetworkTimeoutResponse", EdgeNetworkTimeoutResponse),
						"529": decodeError("ProviderOverloadedResponse", ProviderOverloadedResponse),
						orElse: unexpectedStatus,
					}),
				),
			),
		listModelsCount: () =>
			HttpClientRequest.get(`/models/count`).pipe(
				withResponse(
					HttpClientResponse.matchStatus({
						"2xx": decodeSuccess(ModelsCountResponse),
						"500": decodeError("InternalServerResponse", InternalServerResponse),
						orElse: unexpectedStatus,
					}),
				),
			),
		getModels: (options: any) =>
			HttpClientRequest.get(`/models`).pipe(
				HttpClientRequest.setUrlParams({
					category: options?.["category"] as any,
					supported_parameters: options?.["supported_parameters"] as any,
				}),
				withResponse(
					HttpClientResponse.matchStatus({
						"2xx": decodeSuccess(ModelsListResponse),
						"400": decodeError("BadRequestResponse", BadRequestResponse),
						"500": decodeError("InternalServerResponse", InternalServerResponse),
						orElse: unexpectedStatus,
					}),
				),
			),
		listModelsUser: () =>
			HttpClientRequest.get(`/models/user`).pipe(
				withResponse(
					HttpClientResponse.matchStatus({
						"2xx": decodeSuccess(ModelsListResponse),
						"401": decodeError("UnauthorizedResponse", UnauthorizedResponse),
						"500": decodeError("InternalServerResponse", InternalServerResponse),
						orElse: unexpectedStatus,
					}),
				),
			),
		listEndpoints: (author: any, slug: any) =>
			HttpClientRequest.get(`/models/${author}/${slug}/endpoints`).pipe(
				withResponse(
					HttpClientResponse.matchStatus({
						"2xx": decodeSuccess(ListEndpoints200),
						"404": decodeError("NotFoundResponse", NotFoundResponse),
						"500": decodeError("InternalServerResponse", InternalServerResponse),
						orElse: unexpectedStatus,
					}),
				),
			),
		listEndpointsZdr: () =>
			HttpClientRequest.get(`/endpoints/zdr`).pipe(
				withResponse(
					HttpClientResponse.matchStatus({
						"2xx": decodeSuccess(ListEndpointsZdr200),
						"500": decodeError("InternalServerResponse", InternalServerResponse),
						orElse: unexpectedStatus,
					}),
				),
			),
		listProviders: () =>
			HttpClientRequest.get(`/providers`).pipe(
				withResponse(
					HttpClientResponse.matchStatus({
						"2xx": decodeSuccess(ListProviders200),
						"500": decodeError("InternalServerResponse", InternalServerResponse),
						orElse: unexpectedStatus,
					}),
				),
			),
		list: (options: any) =>
			HttpClientRequest.get(`/keys`).pipe(
				HttpClientRequest.setUrlParams({
					include_disabled: options?.["include_disabled"] as any,
					offset: options?.["offset"] as any,
				}),
				withResponse(
					HttpClientResponse.matchStatus({
						"2xx": decodeSuccess(List200),
						"401": decodeError("UnauthorizedResponse", UnauthorizedResponse),
						"429": decodeError("TooManyRequestsResponse", TooManyRequestsResponse),
						"500": decodeError("InternalServerResponse", InternalServerResponse),
						orElse: unexpectedStatus,
					}),
				),
			),
		createKeys: (options: any) =>
			HttpClientRequest.post(`/keys`).pipe(
				HttpClientRequest.bodyJsonUnsafe(options),
				withResponse(
					HttpClientResponse.matchStatus({
						"2xx": decodeSuccess(CreateKeys201),
						"400": decodeError("BadRequestResponse", BadRequestResponse),
						"401": decodeError("UnauthorizedResponse", UnauthorizedResponse),
						"429": decodeError("TooManyRequestsResponse", TooManyRequestsResponse),
						"500": decodeError("InternalServerResponse", InternalServerResponse),
						orElse: unexpectedStatus,
					}),
				),
			),
		getKey: (hash: any) =>
			HttpClientRequest.get(`/keys/${hash}`).pipe(
				withResponse(
					HttpClientResponse.matchStatus({
						"2xx": decodeSuccess(GetKey200),
						"401": decodeError("UnauthorizedResponse", UnauthorizedResponse),
						"404": decodeError("NotFoundResponse", NotFoundResponse),
						"429": decodeError("TooManyRequestsResponse", TooManyRequestsResponse),
						"500": decodeError("InternalServerResponse", InternalServerResponse),
						orElse: unexpectedStatus,
					}),
				),
			),
		deleteKeys: (hash: any) =>
			HttpClientRequest.delete(`/keys/${hash}`).pipe(
				withResponse(
					HttpClientResponse.matchStatus({
						"2xx": decodeSuccess(DeleteKeys200),
						"401": decodeError("UnauthorizedResponse", UnauthorizedResponse),
						"404": decodeError("NotFoundResponse", NotFoundResponse),
						"429": decodeError("TooManyRequestsResponse", TooManyRequestsResponse),
						"500": decodeError("InternalServerResponse", InternalServerResponse),
						orElse: unexpectedStatus,
					}),
				),
			),
		updateKeys: (hash: any, options: any) =>
			HttpClientRequest.patch(`/keys/${hash}`).pipe(
				HttpClientRequest.bodyJsonUnsafe(options),
				withResponse(
					HttpClientResponse.matchStatus({
						"2xx": decodeSuccess(UpdateKeys200),
						"400": decodeError("BadRequestResponse", BadRequestResponse),
						"401": decodeError("UnauthorizedResponse", UnauthorizedResponse),
						"404": decodeError("NotFoundResponse", NotFoundResponse),
						"429": decodeError("TooManyRequestsResponse", TooManyRequestsResponse),
						"500": decodeError("InternalServerResponse", InternalServerResponse),
						orElse: unexpectedStatus,
					}),
				),
			),
		listGuardrails: (options: any) =>
			HttpClientRequest.get(`/guardrails`).pipe(
				HttpClientRequest.setUrlParams({
					offset: options?.["offset"] as any,
					limit: options?.["limit"] as any,
				}),
				withResponse(
					HttpClientResponse.matchStatus({
						"2xx": decodeSuccess(ListGuardrails200),
						"401": decodeError("UnauthorizedResponse", UnauthorizedResponse),
						"500": decodeError("InternalServerResponse", InternalServerResponse),
						orElse: unexpectedStatus,
					}),
				),
			),
		createGuardrail: (options: any) =>
			HttpClientRequest.post(`/guardrails`).pipe(
				HttpClientRequest.bodyJsonUnsafe(options),
				withResponse(
					HttpClientResponse.matchStatus({
						"2xx": decodeSuccess(CreateGuardrail201),
						"400": decodeError("BadRequestResponse", BadRequestResponse),
						"401": decodeError("UnauthorizedResponse", UnauthorizedResponse),
						"500": decodeError("InternalServerResponse", InternalServerResponse),
						orElse: unexpectedStatus,
					}),
				),
			),
		getGuardrail: (id: any) =>
			HttpClientRequest.get(`/guardrails/${id}`).pipe(
				withResponse(
					HttpClientResponse.matchStatus({
						"2xx": decodeSuccess(GetGuardrail200),
						"401": decodeError("UnauthorizedResponse", UnauthorizedResponse),
						"404": decodeError("NotFoundResponse", NotFoundResponse),
						"500": decodeError("InternalServerResponse", InternalServerResponse),
						orElse: unexpectedStatus,
					}),
				),
			),
		deleteGuardrail: (id: any) =>
			HttpClientRequest.delete(`/guardrails/${id}`).pipe(
				withResponse(
					HttpClientResponse.matchStatus({
						"2xx": decodeSuccess(DeleteGuardrail200),
						"401": decodeError("UnauthorizedResponse", UnauthorizedResponse),
						"404": decodeError("NotFoundResponse", NotFoundResponse),
						"500": decodeError("InternalServerResponse", InternalServerResponse),
						orElse: unexpectedStatus,
					}),
				),
			),
		updateGuardrail: (id: any, options: any) =>
			HttpClientRequest.patch(`/guardrails/${id}`).pipe(
				HttpClientRequest.bodyJsonUnsafe(options),
				withResponse(
					HttpClientResponse.matchStatus({
						"2xx": decodeSuccess(UpdateGuardrail200),
						"400": decodeError("BadRequestResponse", BadRequestResponse),
						"401": decodeError("UnauthorizedResponse", UnauthorizedResponse),
						"404": decodeError("NotFoundResponse", NotFoundResponse),
						"500": decodeError("InternalServerResponse", InternalServerResponse),
						orElse: unexpectedStatus,
					}),
				),
			),
		listKeyAssignments: (options: any) =>
			HttpClientRequest.get(`/guardrails/assignments/keys`).pipe(
				HttpClientRequest.setUrlParams({
					offset: options?.["offset"] as any,
					limit: options?.["limit"] as any,
				}),
				withResponse(
					HttpClientResponse.matchStatus({
						"2xx": decodeSuccess(ListKeyAssignments200),
						"401": decodeError("UnauthorizedResponse", UnauthorizedResponse),
						"500": decodeError("InternalServerResponse", InternalServerResponse),
						orElse: unexpectedStatus,
					}),
				),
			),
		listMemberAssignments: (options: any) =>
			HttpClientRequest.get(`/guardrails/assignments/members`).pipe(
				HttpClientRequest.setUrlParams({
					offset: options?.["offset"] as any,
					limit: options?.["limit"] as any,
				}),
				withResponse(
					HttpClientResponse.matchStatus({
						"2xx": decodeSuccess(ListMemberAssignments200),
						"401": decodeError("UnauthorizedResponse", UnauthorizedResponse),
						"500": decodeError("InternalServerResponse", InternalServerResponse),
						orElse: unexpectedStatus,
					}),
				),
			),
		listGuardrailKeyAssignments: (id: any, options: any) =>
			HttpClientRequest.get(`/guardrails/${id}/assignments/keys`).pipe(
				HttpClientRequest.setUrlParams({
					offset: options?.["offset"] as any,
					limit: options?.["limit"] as any,
				}),
				withResponse(
					HttpClientResponse.matchStatus({
						"2xx": decodeSuccess(ListGuardrailKeyAssignments200),
						"401": decodeError("UnauthorizedResponse", UnauthorizedResponse),
						"404": decodeError("NotFoundResponse", NotFoundResponse),
						"500": decodeError("InternalServerResponse", InternalServerResponse),
						orElse: unexpectedStatus,
					}),
				),
			),
		bulkAssignKeysToGuardrail: (id: any, options: any) =>
			HttpClientRequest.post(`/guardrails/${id}/assignments/keys`).pipe(
				HttpClientRequest.bodyJsonUnsafe(options),
				withResponse(
					HttpClientResponse.matchStatus({
						"2xx": decodeSuccess(BulkAssignKeysToGuardrail200),
						"400": decodeError("BadRequestResponse", BadRequestResponse),
						"401": decodeError("UnauthorizedResponse", UnauthorizedResponse),
						"404": decodeError("NotFoundResponse", NotFoundResponse),
						"500": decodeError("InternalServerResponse", InternalServerResponse),
						orElse: unexpectedStatus,
					}),
				),
			),
		listGuardrailMemberAssignments: (id: any, options: any) =>
			HttpClientRequest.get(`/guardrails/${id}/assignments/members`).pipe(
				HttpClientRequest.setUrlParams({
					offset: options?.["offset"] as any,
					limit: options?.["limit"] as any,
				}),
				withResponse(
					HttpClientResponse.matchStatus({
						"2xx": decodeSuccess(ListGuardrailMemberAssignments200),
						"401": decodeError("UnauthorizedResponse", UnauthorizedResponse),
						"404": decodeError("NotFoundResponse", NotFoundResponse),
						"500": decodeError("InternalServerResponse", InternalServerResponse),
						orElse: unexpectedStatus,
					}),
				),
			),
		bulkAssignMembersToGuardrail: (id: any, options: any) =>
			HttpClientRequest.post(`/guardrails/${id}/assignments/members`).pipe(
				HttpClientRequest.bodyJsonUnsafe(options),
				withResponse(
					HttpClientResponse.matchStatus({
						"2xx": decodeSuccess(BulkAssignMembersToGuardrail200),
						"400": decodeError("BadRequestResponse", BadRequestResponse),
						"401": decodeError("UnauthorizedResponse", UnauthorizedResponse),
						"404": decodeError("NotFoundResponse", NotFoundResponse),
						"500": decodeError("InternalServerResponse", InternalServerResponse),
						orElse: unexpectedStatus,
					}),
				),
			),
		bulkUnassignKeysFromGuardrail: (id: any, options: any) =>
			HttpClientRequest.post(`/guardrails/${id}/assignments/keys/remove`).pipe(
				HttpClientRequest.bodyJsonUnsafe(options),
				withResponse(
					HttpClientResponse.matchStatus({
						"2xx": decodeSuccess(BulkUnassignKeysFromGuardrail200),
						"400": decodeError("BadRequestResponse", BadRequestResponse),
						"401": decodeError("UnauthorizedResponse", UnauthorizedResponse),
						"404": decodeError("NotFoundResponse", NotFoundResponse),
						"500": decodeError("InternalServerResponse", InternalServerResponse),
						orElse: unexpectedStatus,
					}),
				),
			),
		bulkUnassignMembersFromGuardrail: (id: any, options: any) =>
			HttpClientRequest.post(`/guardrails/${id}/assignments/members/remove`).pipe(
				HttpClientRequest.bodyJsonUnsafe(options),
				withResponse(
					HttpClientResponse.matchStatus({
						"2xx": decodeSuccess(BulkUnassignMembersFromGuardrail200),
						"400": decodeError("BadRequestResponse", BadRequestResponse),
						"401": decodeError("UnauthorizedResponse", UnauthorizedResponse),
						"404": decodeError("NotFoundResponse", NotFoundResponse),
						"500": decodeError("InternalServerResponse", InternalServerResponse),
						orElse: unexpectedStatus,
					}),
				),
			),
		getCurrentKey: () =>
			HttpClientRequest.get(`/key`).pipe(
				withResponse(
					HttpClientResponse.matchStatus({
						"2xx": decodeSuccess(GetCurrentKey200),
						"401": decodeError("UnauthorizedResponse", UnauthorizedResponse),
						"500": decodeError("InternalServerResponse", InternalServerResponse),
						orElse: unexpectedStatus,
					}),
				),
			),
		exchangeAuthCodeForAPIKey: (options: any) =>
			HttpClientRequest.post(`/auth/keys`).pipe(
				HttpClientRequest.bodyJsonUnsafe(options),
				withResponse(
					HttpClientResponse.matchStatus({
						"2xx": decodeSuccess(ExchangeAuthCodeForAPIKey200),
						"400": decodeError("BadRequestResponse", BadRequestResponse),
						"403": decodeError("ForbiddenResponse", ForbiddenResponse),
						"500": decodeError("InternalServerResponse", InternalServerResponse),
						orElse: unexpectedStatus,
					}),
				),
			),
		createAuthKeysCode: (options: any) =>
			HttpClientRequest.post(`/auth/keys/code`).pipe(
				HttpClientRequest.bodyJsonUnsafe(options),
				withResponse(
					HttpClientResponse.matchStatus({
						"2xx": decodeSuccess(CreateAuthKeysCode200),
						"400": decodeError("BadRequestResponse", BadRequestResponse),
						"401": decodeError("UnauthorizedResponse", UnauthorizedResponse),
						"500": decodeError("InternalServerResponse", InternalServerResponse),
						orElse: unexpectedStatus,
					}),
				),
			),
		sendChatCompletionRequest: (options: any) =>
			HttpClientRequest.post(`/chat/completions`).pipe(
				HttpClientRequest.bodyJsonUnsafe(options),
				withResponse(
					HttpClientResponse.matchStatus({
						"2xx": decodeSuccess(ChatResponse),
						"400": decodeError("ChatError", ChatError),
						"401": decodeError("ChatError", ChatError),
						"429": decodeError("ChatError", ChatError),
						"500": decodeError("ChatError", ChatError),
						orElse: unexpectedStatus,
					}),
				),
			),
		createCompletions: (options: any) =>
			HttpClientRequest.post(`/completions`).pipe(
				HttpClientRequest.bodyJsonUnsafe(options),
				withResponse(
					HttpClientResponse.matchStatus({
						"2xx": decodeSuccess(CompletionResponse),
						"400": decodeError("ChatError", ChatError),
						"401": decodeError("ChatError", ChatError),
						"429": decodeError("ChatError", ChatError),
						"500": decodeError("ChatError", ChatError),
						orElse: unexpectedStatus,
					}),
				),
			),
	}) as any as Client
}

export interface Client {
	readonly httpClient: HttpClient.HttpClient
	/**
	 * Creates a streaming or non-streaming response using OpenResponses API format
	 */
	readonly createResponses: (
		options: typeof OpenResponsesRequest.Encoded,
	) => Effect.Effect<
		typeof OpenResponsesNonStreamingResponse.Type,
		| HttpClientError.HttpClientError
		| S.SchemaError
		| ClientError<"BadRequestResponse", typeof BadRequestResponse.Type>
		| ClientError<"UnauthorizedResponse", typeof UnauthorizedResponse.Type>
		| ClientError<"PaymentRequiredResponse", typeof PaymentRequiredResponse.Type>
		| ClientError<"NotFoundResponse", typeof NotFoundResponse.Type>
		| ClientError<"RequestTimeoutResponse", typeof RequestTimeoutResponse.Type>
		| ClientError<"PayloadTooLargeResponse", typeof PayloadTooLargeResponse.Type>
		| ClientError<"UnprocessableEntityResponse", typeof UnprocessableEntityResponse.Type>
		| ClientError<"TooManyRequestsResponse", typeof TooManyRequestsResponse.Type>
		| ClientError<"InternalServerResponse", typeof InternalServerResponse.Type>
		| ClientError<"BadGatewayResponse", typeof BadGatewayResponse.Type>
		| ClientError<"ServiceUnavailableResponse", typeof ServiceUnavailableResponse.Type>
		| ClientError<"EdgeNetworkTimeoutResponse", typeof EdgeNetworkTimeoutResponse.Type>
		| ClientError<"ProviderOverloadedResponse", typeof ProviderOverloadedResponse.Type>
	>
	/**
	 * Creates a message using the Anthropic Messages API format. Supports text, images, PDFs, tools, and extended thinking.
	 */
	readonly createMessages: (
		options: typeof AnthropicMessagesRequest.Encoded,
	) => Effect.Effect<
		typeof AnthropicMessagesResponse.Type,
		| HttpClientError.HttpClientError
		| S.SchemaError
		| ClientError<"CreateMessages400", typeof CreateMessages400.Type>
		| ClientError<"CreateMessages401", typeof CreateMessages401.Type>
		| ClientError<"CreateMessages403", typeof CreateMessages403.Type>
		| ClientError<"CreateMessages404", typeof CreateMessages404.Type>
		| ClientError<"CreateMessages429", typeof CreateMessages429.Type>
		| ClientError<"CreateMessages500", typeof CreateMessages500.Type>
		| ClientError<"CreateMessages503", typeof CreateMessages503.Type>
		| ClientError<"CreateMessages529", typeof CreateMessages529.Type>
	>
	/**
	 * Returns user activity data grouped by endpoint for the last 30 (completed) UTC days. [Provisioning key](/docs/guides/overview/auth/provisioning-api-keys) required.
	 */
	readonly getUserActivity: (
		options?: typeof GetUserActivityParams.Encoded | undefined,
	) => Effect.Effect<
		typeof GetUserActivity200.Type,
		| HttpClientError.HttpClientError
		| S.SchemaError
		| ClientError<"BadRequestResponse", typeof BadRequestResponse.Type>
		| ClientError<"UnauthorizedResponse", typeof UnauthorizedResponse.Type>
		| ClientError<"ForbiddenResponse", typeof ForbiddenResponse.Type>
		| ClientError<"InternalServerResponse", typeof InternalServerResponse.Type>
	>
	/**
	 * Get total credits purchased and used for the authenticated user. [Provisioning key](/docs/guides/overview/auth/provisioning-api-keys) required.
	 */
	readonly getCredits: () => Effect.Effect<
		typeof GetCredits200.Type,
		| HttpClientError.HttpClientError
		| S.SchemaError
		| ClientError<"UnauthorizedResponse", typeof UnauthorizedResponse.Type>
		| ClientError<"ForbiddenResponse", typeof ForbiddenResponse.Type>
		| ClientError<"InternalServerResponse", typeof InternalServerResponse.Type>
	>
	/**
	 * Create a Coinbase charge for crypto payment
	 */
	readonly createCoinbaseCharge: (
		options: typeof CreateChargeRequest.Encoded,
	) => Effect.Effect<
		typeof CreateCoinbaseCharge200.Type,
		| HttpClientError.HttpClientError
		| S.SchemaError
		| ClientError<"BadRequestResponse", typeof BadRequestResponse.Type>
		| ClientError<"UnauthorizedResponse", typeof UnauthorizedResponse.Type>
		| ClientError<"TooManyRequestsResponse", typeof TooManyRequestsResponse.Type>
		| ClientError<"InternalServerResponse", typeof InternalServerResponse.Type>
	>
	/**
	 * Submits an embedding request to the embeddings router
	 */
	readonly createEmbeddings: (
		options: typeof CreateEmbeddingsRequest.Encoded,
	) => Effect.Effect<
		typeof CreateEmbeddings200.Type,
		| HttpClientError.HttpClientError
		| S.SchemaError
		| ClientError<"BadRequestResponse", typeof BadRequestResponse.Type>
		| ClientError<"UnauthorizedResponse", typeof UnauthorizedResponse.Type>
		| ClientError<"PaymentRequiredResponse", typeof PaymentRequiredResponse.Type>
		| ClientError<"NotFoundResponse", typeof NotFoundResponse.Type>
		| ClientError<"TooManyRequestsResponse", typeof TooManyRequestsResponse.Type>
		| ClientError<"InternalServerResponse", typeof InternalServerResponse.Type>
		| ClientError<"BadGatewayResponse", typeof BadGatewayResponse.Type>
		| ClientError<"ServiceUnavailableResponse", typeof ServiceUnavailableResponse.Type>
		| ClientError<"EdgeNetworkTimeoutResponse", typeof EdgeNetworkTimeoutResponse.Type>
		| ClientError<"ProviderOverloadedResponse", typeof ProviderOverloadedResponse.Type>
	>
	/**
	 * Returns a list of all available embeddings models and their properties
	 */
	readonly listEmbeddingsModels: () => Effect.Effect<
		typeof ModelsListResponse.Type,
		| HttpClientError.HttpClientError
		| S.SchemaError
		| ClientError<"BadRequestResponse", typeof BadRequestResponse.Type>
		| ClientError<"InternalServerResponse", typeof InternalServerResponse.Type>
	>
	/**
	 * Get request & usage metadata for a generation
	 */
	readonly getGeneration: (
		options: typeof GetGenerationParams.Encoded,
	) => Effect.Effect<
		typeof GetGeneration200.Type,
		| HttpClientError.HttpClientError
		| S.SchemaError
		| ClientError<"UnauthorizedResponse", typeof UnauthorizedResponse.Type>
		| ClientError<"PaymentRequiredResponse", typeof PaymentRequiredResponse.Type>
		| ClientError<"NotFoundResponse", typeof NotFoundResponse.Type>
		| ClientError<"TooManyRequestsResponse", typeof TooManyRequestsResponse.Type>
		| ClientError<"InternalServerResponse", typeof InternalServerResponse.Type>
		| ClientError<"BadGatewayResponse", typeof BadGatewayResponse.Type>
		| ClientError<"EdgeNetworkTimeoutResponse", typeof EdgeNetworkTimeoutResponse.Type>
		| ClientError<"ProviderOverloadedResponse", typeof ProviderOverloadedResponse.Type>
	>
	/**
	 * Get total count of available models
	 */
	readonly listModelsCount: () => Effect.Effect<
		typeof ModelsCountResponse.Type,
		| HttpClientError.HttpClientError
		| S.SchemaError
		| ClientError<"InternalServerResponse", typeof InternalServerResponse.Type>
	>
	/**
	 * List all models and their properties
	 */
	readonly getModels: (
		options?: typeof GetModelsParams.Encoded | undefined,
	) => Effect.Effect<
		typeof ModelsListResponse.Type,
		| HttpClientError.HttpClientError
		| S.SchemaError
		| ClientError<"BadRequestResponse", typeof BadRequestResponse.Type>
		| ClientError<"InternalServerResponse", typeof InternalServerResponse.Type>
	>
	/**
	 * List models filtered by user provider preferences
	 */
	readonly listModelsUser: () => Effect.Effect<
		typeof ModelsListResponse.Type,
		| HttpClientError.HttpClientError
		| S.SchemaError
		| ClientError<"UnauthorizedResponse", typeof UnauthorizedResponse.Type>
		| ClientError<"InternalServerResponse", typeof InternalServerResponse.Type>
	>
	/**
	 * List all endpoints for a model
	 */
	readonly listEndpoints: (
		author: string,
		slug: string,
	) => Effect.Effect<
		typeof ListEndpoints200.Type,
		| HttpClientError.HttpClientError
		| S.SchemaError
		| ClientError<"NotFoundResponse", typeof NotFoundResponse.Type>
		| ClientError<"InternalServerResponse", typeof InternalServerResponse.Type>
	>
	/**
	 * Preview the impact of ZDR on the available endpoints
	 */
	readonly listEndpointsZdr: () => Effect.Effect<
		typeof ListEndpointsZdr200.Type,
		| HttpClientError.HttpClientError
		| S.SchemaError
		| ClientError<"InternalServerResponse", typeof InternalServerResponse.Type>
	>
	/**
	 * List all providers
	 */
	readonly listProviders: () => Effect.Effect<
		typeof ListProviders200.Type,
		| HttpClientError.HttpClientError
		| S.SchemaError
		| ClientError<"InternalServerResponse", typeof InternalServerResponse.Type>
	>
	/**
	 * List all API keys for the authenticated user. [Provisioning key](/docs/guides/overview/auth/provisioning-api-keys) required.
	 */
	readonly list: (
		options?: typeof ListParams.Encoded | undefined,
	) => Effect.Effect<
		typeof List200.Type,
		| HttpClientError.HttpClientError
		| S.SchemaError
		| ClientError<"UnauthorizedResponse", typeof UnauthorizedResponse.Type>
		| ClientError<"TooManyRequestsResponse", typeof TooManyRequestsResponse.Type>
		| ClientError<"InternalServerResponse", typeof InternalServerResponse.Type>
	>
	/**
	 * Create a new API key for the authenticated user. [Provisioning key](/docs/guides/overview/auth/provisioning-api-keys) required.
	 */
	readonly createKeys: (
		options: typeof CreateKeysRequest.Encoded,
	) => Effect.Effect<
		typeof CreateKeys201.Type,
		| HttpClientError.HttpClientError
		| S.SchemaError
		| ClientError<"BadRequestResponse", typeof BadRequestResponse.Type>
		| ClientError<"UnauthorizedResponse", typeof UnauthorizedResponse.Type>
		| ClientError<"TooManyRequestsResponse", typeof TooManyRequestsResponse.Type>
		| ClientError<"InternalServerResponse", typeof InternalServerResponse.Type>
	>
	/**
	 * Get a single API key by hash. [Provisioning key](/docs/guides/overview/auth/provisioning-api-keys) required.
	 */
	readonly getKey: (
		hash: string,
	) => Effect.Effect<
		typeof GetKey200.Type,
		| HttpClientError.HttpClientError
		| S.SchemaError
		| ClientError<"UnauthorizedResponse", typeof UnauthorizedResponse.Type>
		| ClientError<"NotFoundResponse", typeof NotFoundResponse.Type>
		| ClientError<"TooManyRequestsResponse", typeof TooManyRequestsResponse.Type>
		| ClientError<"InternalServerResponse", typeof InternalServerResponse.Type>
	>
	/**
	 * Delete an existing API key. [Provisioning key](/docs/guides/overview/auth/provisioning-api-keys) required.
	 */
	readonly deleteKeys: (
		hash: string,
	) => Effect.Effect<
		typeof DeleteKeys200.Type,
		| HttpClientError.HttpClientError
		| S.SchemaError
		| ClientError<"UnauthorizedResponse", typeof UnauthorizedResponse.Type>
		| ClientError<"NotFoundResponse", typeof NotFoundResponse.Type>
		| ClientError<"TooManyRequestsResponse", typeof TooManyRequestsResponse.Type>
		| ClientError<"InternalServerResponse", typeof InternalServerResponse.Type>
	>
	/**
	 * Update an existing API key. [Provisioning key](/docs/guides/overview/auth/provisioning-api-keys) required.
	 */
	readonly updateKeys: (
		hash: string,
		options: typeof UpdateKeysRequest.Encoded,
	) => Effect.Effect<
		typeof UpdateKeys200.Type,
		| HttpClientError.HttpClientError
		| S.SchemaError
		| ClientError<"BadRequestResponse", typeof BadRequestResponse.Type>
		| ClientError<"UnauthorizedResponse", typeof UnauthorizedResponse.Type>
		| ClientError<"NotFoundResponse", typeof NotFoundResponse.Type>
		| ClientError<"TooManyRequestsResponse", typeof TooManyRequestsResponse.Type>
		| ClientError<"InternalServerResponse", typeof InternalServerResponse.Type>
	>
	/**
	 * List all guardrails for the authenticated user. [Provisioning key](/docs/guides/overview/auth/provisioning-api-keys) required.
	 */
	readonly listGuardrails: (
		options?: typeof ListGuardrailsParams.Encoded | undefined,
	) => Effect.Effect<
		typeof ListGuardrails200.Type,
		| HttpClientError.HttpClientError
		| S.SchemaError
		| ClientError<"UnauthorizedResponse", typeof UnauthorizedResponse.Type>
		| ClientError<"InternalServerResponse", typeof InternalServerResponse.Type>
	>
	/**
	 * Create a new guardrail for the authenticated user. [Provisioning key](/docs/guides/overview/auth/provisioning-api-keys) required.
	 */
	readonly createGuardrail: (
		options: typeof CreateGuardrailRequest.Encoded,
	) => Effect.Effect<
		typeof CreateGuardrail201.Type,
		| HttpClientError.HttpClientError
		| S.SchemaError
		| ClientError<"BadRequestResponse", typeof BadRequestResponse.Type>
		| ClientError<"UnauthorizedResponse", typeof UnauthorizedResponse.Type>
		| ClientError<"InternalServerResponse", typeof InternalServerResponse.Type>
	>
	/**
	 * Get a single guardrail by ID. [Provisioning key](/docs/guides/overview/auth/provisioning-api-keys) required.
	 */
	readonly getGuardrail: (
		id: string,
	) => Effect.Effect<
		typeof GetGuardrail200.Type,
		| HttpClientError.HttpClientError
		| S.SchemaError
		| ClientError<"UnauthorizedResponse", typeof UnauthorizedResponse.Type>
		| ClientError<"NotFoundResponse", typeof NotFoundResponse.Type>
		| ClientError<"InternalServerResponse", typeof InternalServerResponse.Type>
	>
	/**
	 * Delete an existing guardrail. [Provisioning key](/docs/guides/overview/auth/provisioning-api-keys) required.
	 */
	readonly deleteGuardrail: (
		id: string,
	) => Effect.Effect<
		typeof DeleteGuardrail200.Type,
		| HttpClientError.HttpClientError
		| S.SchemaError
		| ClientError<"UnauthorizedResponse", typeof UnauthorizedResponse.Type>
		| ClientError<"NotFoundResponse", typeof NotFoundResponse.Type>
		| ClientError<"InternalServerResponse", typeof InternalServerResponse.Type>
	>
	/**
	 * Update an existing guardrail. [Provisioning key](/docs/guides/overview/auth/provisioning-api-keys) required.
	 */
	readonly updateGuardrail: (
		id: string,
		options: typeof UpdateGuardrailRequest.Encoded,
	) => Effect.Effect<
		typeof UpdateGuardrail200.Type,
		| HttpClientError.HttpClientError
		| S.SchemaError
		| ClientError<"BadRequestResponse", typeof BadRequestResponse.Type>
		| ClientError<"UnauthorizedResponse", typeof UnauthorizedResponse.Type>
		| ClientError<"NotFoundResponse", typeof NotFoundResponse.Type>
		| ClientError<"InternalServerResponse", typeof InternalServerResponse.Type>
	>
	/**
	 * List all API key guardrail assignments for the authenticated user. [Provisioning key](/docs/guides/overview/auth/provisioning-api-keys) required.
	 */
	readonly listKeyAssignments: (
		options?: typeof ListKeyAssignmentsParams.Encoded | undefined,
	) => Effect.Effect<
		typeof ListKeyAssignments200.Type,
		| HttpClientError.HttpClientError
		| S.SchemaError
		| ClientError<"UnauthorizedResponse", typeof UnauthorizedResponse.Type>
		| ClientError<"InternalServerResponse", typeof InternalServerResponse.Type>
	>
	/**
	 * List all organization member guardrail assignments for the authenticated user. [Provisioning key](/docs/guides/overview/auth/provisioning-api-keys) required.
	 */
	readonly listMemberAssignments: (
		options?: typeof ListMemberAssignmentsParams.Encoded | undefined,
	) => Effect.Effect<
		typeof ListMemberAssignments200.Type,
		| HttpClientError.HttpClientError
		| S.SchemaError
		| ClientError<"UnauthorizedResponse", typeof UnauthorizedResponse.Type>
		| ClientError<"InternalServerResponse", typeof InternalServerResponse.Type>
	>
	/**
	 * List all API key assignments for a specific guardrail. [Provisioning key](/docs/guides/overview/auth/provisioning-api-keys) required.
	 */
	readonly listGuardrailKeyAssignments: (
		id: string,
		options?: typeof ListGuardrailKeyAssignmentsParams.Encoded | undefined,
	) => Effect.Effect<
		typeof ListGuardrailKeyAssignments200.Type,
		| HttpClientError.HttpClientError
		| S.SchemaError
		| ClientError<"UnauthorizedResponse", typeof UnauthorizedResponse.Type>
		| ClientError<"NotFoundResponse", typeof NotFoundResponse.Type>
		| ClientError<"InternalServerResponse", typeof InternalServerResponse.Type>
	>
	/**
	 * Assign multiple API keys to a specific guardrail. [Provisioning key](/docs/guides/overview/auth/provisioning-api-keys) required.
	 */
	readonly bulkAssignKeysToGuardrail: (
		id: string,
		options: typeof BulkAssignKeysToGuardrailRequest.Encoded,
	) => Effect.Effect<
		typeof BulkAssignKeysToGuardrail200.Type,
		| HttpClientError.HttpClientError
		| S.SchemaError
		| ClientError<"BadRequestResponse", typeof BadRequestResponse.Type>
		| ClientError<"UnauthorizedResponse", typeof UnauthorizedResponse.Type>
		| ClientError<"NotFoundResponse", typeof NotFoundResponse.Type>
		| ClientError<"InternalServerResponse", typeof InternalServerResponse.Type>
	>
	/**
	 * List all organization member assignments for a specific guardrail. [Provisioning key](/docs/guides/overview/auth/provisioning-api-keys) required.
	 */
	readonly listGuardrailMemberAssignments: (
		id: string,
		options?: typeof ListGuardrailMemberAssignmentsParams.Encoded | undefined,
	) => Effect.Effect<
		typeof ListGuardrailMemberAssignments200.Type,
		| HttpClientError.HttpClientError
		| S.SchemaError
		| ClientError<"UnauthorizedResponse", typeof UnauthorizedResponse.Type>
		| ClientError<"NotFoundResponse", typeof NotFoundResponse.Type>
		| ClientError<"InternalServerResponse", typeof InternalServerResponse.Type>
	>
	/**
	 * Assign multiple organization members to a specific guardrail. [Provisioning key](/docs/guides/overview/auth/provisioning-api-keys) required.
	 */
	readonly bulkAssignMembersToGuardrail: (
		id: string,
		options: typeof BulkAssignMembersToGuardrailRequest.Encoded,
	) => Effect.Effect<
		typeof BulkAssignMembersToGuardrail200.Type,
		| HttpClientError.HttpClientError
		| S.SchemaError
		| ClientError<"BadRequestResponse", typeof BadRequestResponse.Type>
		| ClientError<"UnauthorizedResponse", typeof UnauthorizedResponse.Type>
		| ClientError<"NotFoundResponse", typeof NotFoundResponse.Type>
		| ClientError<"InternalServerResponse", typeof InternalServerResponse.Type>
	>
	/**
	 * Unassign multiple API keys from a specific guardrail. [Provisioning key](/docs/guides/overview/auth/provisioning-api-keys) required.
	 */
	readonly bulkUnassignKeysFromGuardrail: (
		id: string,
		options: typeof BulkUnassignKeysFromGuardrailRequest.Encoded,
	) => Effect.Effect<
		typeof BulkUnassignKeysFromGuardrail200.Type,
		| HttpClientError.HttpClientError
		| S.SchemaError
		| ClientError<"BadRequestResponse", typeof BadRequestResponse.Type>
		| ClientError<"UnauthorizedResponse", typeof UnauthorizedResponse.Type>
		| ClientError<"NotFoundResponse", typeof NotFoundResponse.Type>
		| ClientError<"InternalServerResponse", typeof InternalServerResponse.Type>
	>
	/**
	 * Unassign multiple organization members from a specific guardrail. [Provisioning key](/docs/guides/overview/auth/provisioning-api-keys) required.
	 */
	readonly bulkUnassignMembersFromGuardrail: (
		id: string,
		options: typeof BulkUnassignMembersFromGuardrailRequest.Encoded,
	) => Effect.Effect<
		typeof BulkUnassignMembersFromGuardrail200.Type,
		| HttpClientError.HttpClientError
		| S.SchemaError
		| ClientError<"BadRequestResponse", typeof BadRequestResponse.Type>
		| ClientError<"UnauthorizedResponse", typeof UnauthorizedResponse.Type>
		| ClientError<"NotFoundResponse", typeof NotFoundResponse.Type>
		| ClientError<"InternalServerResponse", typeof InternalServerResponse.Type>
	>
	/**
	 * Get information on the API key associated with the current authentication session
	 */
	readonly getCurrentKey: () => Effect.Effect<
		typeof GetCurrentKey200.Type,
		| HttpClientError.HttpClientError
		| S.SchemaError
		| ClientError<"UnauthorizedResponse", typeof UnauthorizedResponse.Type>
		| ClientError<"InternalServerResponse", typeof InternalServerResponse.Type>
	>
	/**
	 * Exchange an authorization code from the PKCE flow for a user-controlled API key
	 */
	readonly exchangeAuthCodeForAPIKey: (
		options: typeof ExchangeAuthCodeForAPIKeyRequest.Encoded,
	) => Effect.Effect<
		typeof ExchangeAuthCodeForAPIKey200.Type,
		| HttpClientError.HttpClientError
		| S.SchemaError
		| ClientError<"BadRequestResponse", typeof BadRequestResponse.Type>
		| ClientError<"ForbiddenResponse", typeof ForbiddenResponse.Type>
		| ClientError<"InternalServerResponse", typeof InternalServerResponse.Type>
	>
	/**
	 * Create an authorization code for the PKCE flow to generate a user-controlled API key
	 */
	readonly createAuthKeysCode: (
		options: typeof CreateAuthKeysCodeRequest.Encoded,
	) => Effect.Effect<
		typeof CreateAuthKeysCode200.Type,
		| HttpClientError.HttpClientError
		| S.SchemaError
		| ClientError<"BadRequestResponse", typeof BadRequestResponse.Type>
		| ClientError<"UnauthorizedResponse", typeof UnauthorizedResponse.Type>
		| ClientError<"InternalServerResponse", typeof InternalServerResponse.Type>
	>
	/**
	 * Sends a request for a model response for the given chat conversation. Supports both streaming and non-streaming modes.
	 */
	readonly sendChatCompletionRequest: (
		options: typeof ChatGenerationParams.Encoded,
	) => Effect.Effect<
		typeof ChatResponse.Type,
		| HttpClientError.HttpClientError
		| S.SchemaError
		| ClientError<"ChatError", typeof ChatError.Type>
		| ClientError<"ChatError", typeof ChatError.Type>
		| ClientError<"ChatError", typeof ChatError.Type>
		| ClientError<"ChatError", typeof ChatError.Type>
	>
	/**
	 * Creates a completion for the provided prompt and parameters. Supports both streaming and non-streaming modes.
	 */
	readonly createCompletions: (
		options: typeof CompletionCreateParams.Encoded,
	) => Effect.Effect<
		typeof CompletionResponse.Type,
		| HttpClientError.HttpClientError
		| S.SchemaError
		| ClientError<"ChatError", typeof ChatError.Type>
		| ClientError<"ChatError", typeof ChatError.Type>
		| ClientError<"ChatError", typeof ChatError.Type>
		| ClientError<"ChatError", typeof ChatError.Type>
	>
}

export interface ClientError<Tag extends string, E> {
	readonly _tag: Tag
	readonly request: HttpClientRequest.HttpClientRequest
	readonly response: HttpClientResponse.HttpClientResponse
	readonly cause: E
}

class ClientErrorImpl extends Data.Error<{
	_tag: string
	cause: any
	request: HttpClientRequest.HttpClientRequest
	response: HttpClientResponse.HttpClientResponse
}> {}

export const ClientError = <Tag extends string, E>(
	tag: Tag,
	cause: E,
	response: HttpClientResponse.HttpClientResponse,
): ClientError<Tag, E> =>
	new ClientErrorImpl({
		_tag: tag,
		cause,
		response,
		request: response.request,
	}) as any
