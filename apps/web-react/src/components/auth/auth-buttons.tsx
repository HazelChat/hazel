import { useAuth } from "@workos-inc/authkit-react"
import { Button } from "../base/buttons/button"

export function AuthButtons() {
	const { user, signIn, signUp, signOut, isLoading } = useAuth()

	if (isLoading) {
		return null
	}

	if (user) {
		return (
			<div className="flex items-center gap-4">
				<span className="text-sm text-gray-700">{user.email}</span>
				<Button onClick={() => signOut()} variant="secondary" size="sm">
					Sign out
				</Button>
			</div>
		)
	}

	return (
		<div className="flex items-center gap-2">
			<Button onClick={() => signIn()} variant="secondary" size="sm">
				Sign in
			</Button>
			<Button onClick={() => signUp()} variant="primary" size="sm">
				Sign up
			</Button>
		</div>
	)
}
