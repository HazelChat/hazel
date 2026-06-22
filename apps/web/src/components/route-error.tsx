import { useRouter, type ErrorComponentProps } from "@tanstack/react-router"
import { useState } from "react"
import { Button } from "~/components/ui/button"

export function RouteErrorComponent({ error, reset }: ErrorComponentProps) {
	const router = useRouter()
	const [showDetails, setShowDetails] = useState(false)
	const isDev = import.meta.env.DEV
	const errorMessage = error instanceof Error ? error.message : "Unknown error"
	const errorStack = error instanceof Error ? error.stack : undefined

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 py-16">
			<div className="flex w-full max-w-md flex-col items-center gap-6">
				{/* Mascot with radial fade */}
				<div className="relative w-48">
					<div className="mask-radial-at-center mask-radial-from-black mask-radial-to-transparent aspect-square w-full">
						<img
							src="/images/squirrle_ocean.webp"
							alt=""
							className="h-full w-full object-contain opacity-80"
						/>
					</div>
					{/* Floating question marks for visual interest */}
					<span
						className="absolute -top-2 right-4 animate-bounce text-2xl opacity-60"
						style={{ animationDelay: "0s" }}
					>
						?
					</span>
					<span
						className="absolute -right-2 top-4 animate-bounce text-lg opacity-40"
						style={{ animationDelay: "0.3s" }}
					>
						?
					</span>
				</div>

				{/* Content */}
				<div className="flex flex-col items-center gap-3 text-center">
					<h1 className="font-mono text-3xl font-bold tracking-tight text-fg">Oops!</h1>
					<p className="max-w-sm text-muted-fg">
						Something unexpected happened. Don't worry, it's not your fault — we're looking into
						it.
					</p>
				</div>

				{/* Dev mode: expandable error details */}
				{isDev && (
					<div className="w-full">
						<button
							type="button"
							onClick={() => setShowDetails(!showDetails)}
							className="mb-2 flex w-full items-center justify-between rounded-lg bg-danger/10 px-4 py-2 text-left text-sm text-danger transition-colors hover:bg-danger/15"
						>
							<span className="font-medium">Error Details</span>
							<span className={`transition-transform ${showDetails ? "rotate-180" : ""}`}>
								▼
							</span>
						</button>
						{showDetails && (
							<pre className="max-h-48 overflow-auto rounded-lg bg-secondary p-4 text-left font-mono text-xs text-muted-fg">
								<strong className="text-danger">{errorMessage}</strong>
								{errorStack && (
									<>
										{"\n\n"}
										{errorStack}
									</>
								)}
							</pre>
						)}
					</div>
				)}

				{/* Actions */}
				<div className="flex gap-3">
					<Button intent="primary" size="md" onPress={() => reset()}>
						Try Again
					</Button>
					<Button intent="outline" size="md" onPress={() => router.navigate({ to: "/" })}>
						Back to Home
					</Button>
				</div>
			</div>
		</div>
	)
}
