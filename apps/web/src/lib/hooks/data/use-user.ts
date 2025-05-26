import { createQuery } from "@rocicorp/zero/solid"
import { type Accessor, createMemo } from "solid-js"
import { CACHE_AWHILE } from "~/lib/zero/query-cache-policy"
import { useZero } from "~/lib/zero/zero-context"

export const useUser = (userId: Accessor<string>) => {
	const z = useZero()

	const userQuery = createMemo(() => z.query.users.where((eq) => eq.and(eq.cmp("id", "=", userId()))).one())

	const [user, serversStatus] = createQuery(userQuery, CACHE_AWHILE)

	const isLoading = createMemo(() => serversStatus().type !== "complete")

	return { user, isLoading }
}
