import IconCheck from "~/components/icons/icon-check"
import { IconMapPin } from "~/components/icons/icon-map-pin"
import { IconSparkles } from "~/components/icons/icon-sparkles"
import { motion } from "motion/react"
import { useEffect, useState } from "react"

interface City {
	name: string
	timezone: string
	offset: number
	country: string
}

interface CityCardProps {
	city: City
	isSelected: boolean
	isDetected: boolean
	onClick: () => void
	onHover: (isHovered: boolean) => void
	index: number
}

export function CityCard({ city, isSelected, isDetected, onClick, onHover, index }: CityCardProps) {
	const [time, setTime] = useState("")

	useEffect(() => {
		const updateTime = () => {
			const now = new Date()
			const formatter = new Intl.DateTimeFormat("en-US", {
				timeZone: city.timezone,
				hour: "2-digit",
				minute: "2-digit",
				hour12: true,
			})
			setTime(formatter.format(now))
		}

		updateTime()
		const interval = setInterval(updateTime, 1000)
		return () => clearInterval(interval)
	}, [city.timezone])

	return (
		<motion.button
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.03 }}
			onClick={onClick}
			onMouseEnter={() => onHover(true)}
			onMouseLeave={() => onHover(false)}
			className={`
        relative p-4 rounded-xl text-left transition-all
        ${
			isSelected
				? "bg-primary text-primary-fg ring-2 ring-primary ring-offset-2 ring-offset-bg"
				: "bg-bg hover:bg-secondary border border-border hover:border-primary/50"
		}
      `}
			whileTap={{ scale: 0.98 }}
		>
			{isDetected && !isSelected && (
				<motion.div
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 bg-primary text-primary-fg rounded-full flex items-center gap-0.5 text-[10px] font-medium"
				>
					<IconSparkles className="size-2.5" />
					Detected
				</motion.div>
			)}

			{isSelected && (
				<motion.div
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					className="absolute -top-1.5 -right-1.5 size-6 bg-bg text-primary rounded-full flex items-center justify-center shadow-md"
				>
					<IconCheck className="size-3.5" />
				</motion.div>
			)}

			<div className="flex items-start justify-between gap-2 mb-2">
				<div className="flex items-center gap-1.5">
					<IconMapPin
						className={`size-3.5 ${isSelected ? "text-primary-fg/70" : "text-muted-fg"}`}
					/>
					<span className={`text-xs ${isSelected ? "text-primary-fg/70" : "text-muted-fg"}`}>
						{city.country}
					</span>
				</div>
			</div>

			<h3 className={`font-semibold mb-1 truncate ${isSelected ? "text-primary-fg" : "text-fg"}`}>
				{city.name}
			</h3>

			<div className="flex items-baseline gap-2">
				<span
					className={`text-xl font-bold tabular-nums ${isSelected ? "text-primary-fg" : "text-fg"}`}
				>
					{time}
				</span>
				<span className={`text-xs ${isSelected ? "text-primary-fg/60" : "text-muted-fg"}`}>
					UTC{city.offset >= 0 ? "+" : ""}
					{city.offset}
				</span>
			</div>
		</motion.button>
	)
}
