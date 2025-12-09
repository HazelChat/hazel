/**
 * Durable Streams Protocol Constants
 *
 * Following the Electric Durable Stream Protocol specification.
 */

// Response Headers
export const STREAM_OFFSET_HEADER = "Stream-Next-Offset"
export const STREAM_UP_TO_DATE_HEADER = "Stream-Up-To-Date"
export const STREAM_CURSOR_HEADER = "Stream-Cursor"

// Request Headers
export const STREAM_SEQ_HEADER = "Stream-Seq"
export const STREAM_TTL_HEADER = "Stream-TTL"
export const STREAM_EXPIRES_AT_HEADER = "Stream-Expires-At"

// Query Parameters
export const OFFSET_QUERY_PARAM = "offset"
export const LIVE_QUERY_PARAM = "live"
export const CURSOR_QUERY_PARAM = "cursor"

// Live mode values
export const LIVE_MODE_LONG_POLL = "long-poll"
export const LIVE_MODE_SSE = "sse"

// Special offset value for start of stream
export const START_OFFSET = "-1"

// Default timeout for long-poll in milliseconds
export const DEFAULT_LONG_POLL_TIMEOUT_MS = 30000

// SSE compatible content types
export const SSE_COMPATIBLE_CONTENT_TYPES = ["text/", "application/json"]
