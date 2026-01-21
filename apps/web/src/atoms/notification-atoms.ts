import { HazelRpcClient } from "~/lib/services/common/rpc-atom-client"

/**
 * Mutation atom for bulk deleting notifications by message IDs.
 * Used when messages become visible in the viewport to clear their notifications.
 */
export const deleteNotificationsByMessageIdsMutation = HazelRpcClient.mutation(
	"notification.deleteByMessageIds",
)
