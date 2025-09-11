import { useEffect, useState } from "react"
import { ProgressBar } from "./base/progress-indicators/progress-indicators"

export const Loader = () => {
	const [progress, setProgress] = useState(0)

	useEffect(() => {
		const duration = 3000
		const increment = 100 / (duration / 50)

		const timer = setInterval(() => {
			setProgress((prev) => {
				if (prev >= 100) {
					clearInterval(timer)
					return 100
				}
				return prev + increment
			})
		}, 50)

		return () => clearInterval(timer)
	}, [])

	return (
		<div className="flex h-screen flex-col items-center justify-center gap-3">
			<div className="mask-radial-at-center mask-radial-from-black mask-radial-to-transparent relative aspect-square w-full max-w-sm">
				<img
					src="/images/squirrle_window.png"
					alt="squirrel"
					className="mask-size-[110%_90%] mask-linear-to-r mask-from-black mask-to-transparent mask-center mask-no-repeat mask-[url(/images/image-mask.png)] h-full w-full rounded-md bg-center bg-cover bg-no-repeat object-cover"
				/>
			</div>
			<div className="flex w-full max-w-xl flex-row">
				<ProgressBar min={0} max={100} value={progress} />
			</div>

			<p className="font-bold font-mono text-xl">
				Loading
				<span className="inline-block">
					<span className="animate-bounce [animation-delay:0s]">.</span>
					<span className="animate-bounce [animation-delay:0.2s]">.</span>
					<span className="animate-bounce [animation-delay:0.4s]">.</span>
				</span>
			</p>
		</div>
	)
}
