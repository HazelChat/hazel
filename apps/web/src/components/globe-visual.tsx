import { IconMoon } from "~/components/icons/icon-moon"
import { IconSun } from "~/components/icons/icon-sun"
import { motion } from "motion/react"
import { useEffect, useState } from "react"

interface GlobeVisualProps {
	selectedOffset: number | null
	hoveredOffset: number | null
}

export function GlobeVisual({ selectedOffset, hoveredOffset }: GlobeVisualProps) {
	const [currentHour, setCurrentHour] = useState(0)

	useEffect(() => {
		const updateHour = () => {
			setCurrentHour(new Date().getUTCHours())
		}
		updateHour()
		const interval = setInterval(updateHour, 60000)
		return () => clearInterval(interval)
	}, [])

	const activeOffset = hoveredOffset ?? selectedOffset ?? 0
	const localHour = (currentHour + activeOffset + 24) % 24
	const isDaytime = localHour >= 6 && localHour < 18
	const sunMoonPosition = isDaytime
		? ((localHour - 6) / 12) * 100
		: localHour >= 18
			? ((localHour - 18) / 12) * 100
			: ((localHour + 6) / 12) * 100

	return (
		<div className="relative w-full max-w-md mx-auto aspect-[2/1] mb-6">
			<motion.div
				className="absolute inset-0 rounded-full overflow-hidden"
				animate={{
					background: isDaytime
						? `linear-gradient(to right, 
                hsl(210 40% 85%) 0%, 
                hsl(45 100% 90%) ${sunMoonPosition}%, 
                hsl(200 60% 80%) 100%
              )`
						: `linear-gradient(to right, 
                hsl(230 30% 15%) 0%, 
                hsl(230 40% 25%) ${sunMoonPosition}%, 
                hsl(230 30% 12%) 100%
              )`,
				}}
				transition={{ duration: 0.5 }}
			/>

			{/* Globe outline */}
			<div className="absolute inset-4 rounded-full border-2 border-border/50 overflow-hidden">
				{/* Grid lines */}
				<svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 50">
					{[12.5, 25, 37.5].map((y) => (
						<motion.path
							key={`lat-${y}`}
							d={`M 0 ${y} Q 50 ${y - 5} 100 ${y}`}
							stroke="currentColor"
							strokeWidth="0.3"
							fill="none"
							className={isDaytime ? "text-fg/20" : "text-fg/10"}
							initial={{ pathLength: 0 }}
							animate={{ pathLength: 1 }}
							transition={{ duration: 1, delay: y / 50 }}
						/>
					))}
					{[20, 40, 60, 80].map((x) => (
						<motion.ellipse
							key={`lon-${x}`}
							cx={x}
							cy="25"
							rx={3 + Math.abs(x - 50) / 10}
							ry="20"
							stroke="currentColor"
							strokeWidth="0.3"
							fill="none"
							className={isDaytime ? "text-fg/20" : "text-fg/10"}
							initial={{ pathLength: 0 }}
							animate={{ pathLength: 1 }}
							transition={{ duration: 1, delay: x / 100 }}
						/>
					))}
				</svg>

				<motion.div
					className="absolute top-1/2 -translate-y-1/2 w-10 h-10"
					animate={{
						left: `${sunMoonPosition}%`,
						x: "-50%",
					}}
					transition={{ type: "spring", stiffness: 100, damping: 20 }}
				>
					<motion.div
						className="w-full h-full rounded-full flex items-center justify-center"
						animate={{
							backgroundColor: isDaytime ? "hsl(45 100% 55%)" : "hsl(230 20% 80%)",
							boxShadow: isDaytime
								? "0 0 40px 15px hsla(45, 100%, 55%, 0.5)"
								: "0 0 30px 10px hsla(230, 30%, 80%, 0.3)",
						}}
						transition={{ duration: 0.5 }}
					>
						{isDaytime ? (
							<IconSun className="size-5 text-amber-800" />
						) : (
							<IconMoon className="size-5 text-slate-600" />
						)}
					</motion.div>
				</motion.div>

				{/* Day/Night label */}
				<motion.div
					className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5"
					animate={{
						backgroundColor: isDaytime ? "hsla(45, 100%, 60%, 0.2)" : "hsla(230, 50%, 30%, 0.6)",
						color: isDaytime ? "hsl(45 80% 25%)" : "hsl(230 20% 90%)",
					}}
				>
					{isDaytime ? <IconSun className="size-3" /> : <IconMoon className="size-3" />}
					{isDaytime ? "Daytime" : "Nighttime"} • {localHour.toString().padStart(2, "0")}:00
				</motion.div>
			</div>

			<AnimatedStars visible={!isDaytime} />
		</div>
	)
}

function AnimatedStars({ visible }: { visible: boolean }) {
	const stars = [
		{ x: 8, y: 18, delay: 0, size: 1.5 },
		{ x: 88, y: 12, delay: 0.2, size: 1 },
		{ x: 12, y: 72, delay: 0.4, size: 1.5 },
		{ x: 92, y: 78, delay: 0.1, size: 1 },
		{ x: 4, y: 42, delay: 0.3, size: 2 },
		{ x: 96, y: 48, delay: 0.5, size: 1 },
		{ x: 25, y: 8, delay: 0.15, size: 1 },
		{ x: 75, y: 85, delay: 0.35, size: 1.5 },
	]

	return (
		<>
			{stars.map((star, i) => (
				<motion.div
					key={i}
					className="absolute rounded-full bg-white"
					style={{
						left: `${star.x}%`,
						top: `${star.y}%`,
						width: `${star.size * 2}px`,
						height: `${star.size * 2}px`,
					}}
					animate={{
						opacity: visible ? [0.4, 1, 0.4] : 0,
						scale: visible ? [0.8, 1.3, 0.8] : 0,
					}}
					transition={{
						duration: 2.5,
						delay: star.delay,
						repeat: Number.POSITIVE_INFINITY,
						ease: "easeInOut",
					}}
				/>
			))}
		</>
	)
}
