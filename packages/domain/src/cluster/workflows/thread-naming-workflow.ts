import { Workflow } from "@effect/workflow"
import { ChannelId, MessageId } from "@hazel/schema"

// Thread naming workflow - triggered when a thread reaches 3 messages
// Generates a concise, descriptive name for the thread using AI
export const ThreadNamingWorkflow = Workflow.make({
	name: "ThreadNamingWorkflow",
	payload: {
		threadChannelId: ChannelId,
		originalMessageId: MessageId,
	},
	// Process each thread only once using thread channel ID
	idempotencyKey: (payload) => `thread-naming-${payload.threadChannelId}`,
})

export type ThreadNamingWorkflowPayload = typeof ThreadNamingWorkflow.payloadSchema.Type
