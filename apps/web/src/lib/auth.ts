import { eq, useLiveQuery } from "@tanstack/react-db"
import { useAuth } from "@workos-inc/authkit-react"
import { userCollection } from "~/db/collections"

export const useUser = () => {
	const { user: workosUser } = useAuth()

	const { data } = useLiveQuery(
		(q) =>
			q.from({ user: userCollection }).where(({ user }) => eq(user.externalId, workosUser?.id || "")),
		[workosUser?.id],
	)

	return { user: data[0] }
}
