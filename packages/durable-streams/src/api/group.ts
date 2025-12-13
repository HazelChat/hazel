import { HttpApi, HttpApiEndpoint, HttpApiGroup, HttpApiSchema, OpenApi } from "@effect/platform"
import { Schema } from "effect"
import * as Errors from "./errors"
import * as Schemas from "./schemas"

// =============================================================================
// Path Parameter Schema
// =============================================================================

const StreamPathParam = Schema.Struct({
	path: Schemas.StreamPath,
})

// =============================================================================
// Header Schemas
// =============================================================================

const AppendRequestHeaders = Schema.Struct({
	"stream-seq": Schema.optional(Schema.NumberFromString),
	"content-type": Schema.optional(Schema.String),
})

const _MetadataResponseHeaders = Schema.Struct({
	"stream-next-offset": Schema.String,
	"stream-seq": Schema.String,
	"content-type": Schema.String,
	"stream-total-bytes": Schema.String,
})

// =============================================================================
// HTTP API Group Definition
// =============================================================================

export class DurableStreamsGroup extends HttpApiGroup.make("durable-streams")
	// PUT /v1/stream/:path - Create stream
	.add(
		HttpApiEndpoint.put("create", "/v1/stream/:path")
			.setPath(StreamPathParam)
			.setPayload(Schemas.CreateStreamRequest)
			.addSuccess(Schemas.StreamMetadata, { status: 201 })
			.addError(Errors.StreamAlreadyExistsError)
			.addError(Errors.InternalStreamError)
			.annotateContext(
				OpenApi.annotations({
					title: "Create Stream",
					description: "Create a new durable stream at the specified path",
					summary: "Create a durable stream",
				}),
			),
	)
	// POST /v1/stream/:path - Append data
	.add(
		HttpApiEndpoint.post("append", "/v1/stream/:path")
			.setPath(StreamPathParam)
			.setPayload(HttpApiSchema.Uint8Array())
			.setHeaders(AppendRequestHeaders)
			.addSuccess(Schemas.AppendResponse)
			.addError(Errors.StreamNotFoundError)
			.addError(Errors.SequenceConflictError)
			.addError(Errors.StreamExpiredError)
			.addError(Errors.InvalidContentTypeError)
			.addError(Errors.InternalStreamError)
			.annotateContext(
				OpenApi.annotations({
					title: "Append to Stream",
					description: "Append data to an existing stream",
					summary: "Append data",
				}),
			),
	)
	// GET /v1/stream/:path - Read data
	.add(
		HttpApiEndpoint.get("read", "/v1/stream/:path")
			.setPath(StreamPathParam)
			.setUrlParams(
				Schema.Struct({
					offset: Schema.optional(Schemas.StreamOffset),
					live: Schema.optional(Schemas.LiveMode),
					timeout: Schema.optional(Schema.NumberFromString),
				}),
			)
			.addSuccess(Schemas.ReadResponse)
			.addError(Errors.StreamNotFoundError)
			.addError(Errors.OffsetOutOfRangeError)
			.addError(Errors.StreamExpiredError)
			.addError(Errors.InvalidOffsetError)
			.addError(Errors.InternalStreamError)
			.annotateContext(
				OpenApi.annotations({
					title: "Read from Stream",
					description:
						"Read data from a stream. Supports catch-up (historical), long-poll, and SSE (server-sent events) modes.",
					summary: "Read stream data",
				}),
			),
	)
	// HEAD /v1/stream/:path - Get metadata
	.add(
		HttpApiEndpoint.head("metadata", "/v1/stream/:path")
			.setPath(StreamPathParam)
			.addSuccess(Schema.Void, {
				status: 200,
			})
			.addError(Errors.StreamNotFoundError)
			.addError(Errors.InternalStreamError)
			.annotateContext(
				OpenApi.annotations({
					title: "Get Stream Metadata",
					description: "Get metadata for a stream via response headers",
					summary: "Get stream metadata",
				}),
			),
	)
	// DELETE /v1/stream/:path - Delete stream
	.add(
		HttpApiEndpoint.del("delete", "/v1/stream/:path")
			.setPath(StreamPathParam)
			.addSuccess(Schema.Void, { status: 204 })
			.addError(Errors.StreamNotFoundError)
			.addError(Errors.InternalStreamError)
			.annotateContext(
				OpenApi.annotations({
					title: "Delete Stream",
					description: "Delete a stream and all its data",
					summary: "Delete stream",
				}),
			),
	) {}

// =============================================================================
// Full API Definition
// =============================================================================

export class DurableStreamsApi extends HttpApi.make("durable-streams-api")
	.add(DurableStreamsGroup)
	.annotateContext(
		OpenApi.annotations({
			title: "Durable Streams API",
			description:
				"HTTP API for durable, append-only streams with resumable reads. Based on the durable-streams protocol.",
			version: "1.0.0",
		}),
	) {}
