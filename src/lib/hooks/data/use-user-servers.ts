import { useQuery } from "@rocicorp/zero/solid"
import { createMemo } from "solid-js"
import { useZero } from "~/lib/zero-context"

export const useUserServers = () => {
	const z = useZero()

	const serverQuery = z.query.server
		.whereExists("members", (eq) => eq.where("userId", "=", z.userID))
		.related("owner")

	const [servers, serversStatus] = useQuery(() => serverQuery)

	const isLoading = createMemo(() => serversStatus().type !== "complete")

	return { servers, isLoading }
}
