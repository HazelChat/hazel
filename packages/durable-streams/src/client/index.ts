/**
 * @hazel/durable-streams/client
 *
 * Client-side components for durable streams.
 */

export {
	DurableStream,
	makeDurableStream,
	readJson,
	readText,
	type DurableStreamConfig,
	type ReadOptions,
	type ReadResult,
	type Auth,
} from "./durable-stream.ts"

export {
	type ResumeState,
	ResumeStateTag,
	makeInMemoryResumeState,
	makeLocalStorageResumeState,
	noOpResumeState,
	InMemoryResumeStateLayer,
} from "./resume-state.ts"
