import { useQuery } from "@rocicorp/zero/solid"
import { createMemo } from "solid-js"
import { CACHE_AWHILE } from "~/lib/zero/query-cache-policy"
import { useZero } from "~/lib/zero/zero-context"

export const useCurrentUser = () => {
	const z = useZero()
	const userQuery = z.query.users.where("id", "=", z.userID).one()

	const [user, userStatus] = useQuery(() => userQuery, CACHE_AWHILE)

	const isLoading = createMemo(() => userStatus().type !== "complete")
	return { user, isLoading }
}
