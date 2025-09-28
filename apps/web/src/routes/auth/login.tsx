import { createFileRoute, Navigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { useAuth } from "../../providers/auth-provider"

export const Route = createFileRoute("/auth/login")({
	component: LoginPage,
	validateSearch: (search: Record<string, unknown>) => {
		return {
			returnTo: search.returnTo as string | undefined,
		}
	},
})

function LoginPage() {
	const { user, login, isLoading } = useAuth()
	const search = Route.useSearch()
	const [error, setError] = useState<string | null>(null)
	const [isRedirecting, setIsRedirecting] = useState(false)

	useEffect(() => {
		if (!user && !isLoading && !isRedirecting && !error) {
			// Attempt to login
			setIsRedirecting(true)
			login({ returnTo: location.host + search.returnTo || location.href }).catch((err) => {
				setError(err.message || "Failed to initiate login")
				setIsRedirecting(false)
			})
		}
	}, [user, isLoading, login, search.returnTo, isRedirecting, error])

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-gray-900 border-b-2"></div>
			</div>
		)
	}

	if (user) {
		return <Navigate to={search.returnTo || "/"} />
	}

	if (error) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="max-w-md text-center">
					<h1 className="mb-4 font-semibold text-2xl text-red-600">Login Failed</h1>
					<p className="mb-6 text-gray-600">{error}</p>
					<button
						onClick={() => {
							setError(null)
							setIsRedirecting(false)
						}}
						className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
					>
						Try Again
					</button>
				</div>
			</div>
		)
	}

	return (
		<div className="flex h-screen items-center justify-center">
			<div className="text-center">
				<h1 className="mb-4 font-semibold text-2xl">Redirecting to login...</h1>
				<div className="mx-auto h-8 w-8 animate-spin rounded-full border-gray-900 border-b-2"></div>
			</div>
		</div>
	)
}
