import IconCheck from "~/components/icons/icon-check"
import IconMagnifier3 from "~/components/icons/icon-magnifier-3"
import { IconMapPin } from "~/components/icons/icon-map-pin"
import { useAtomSet } from "@effect-atom/atom-react"
import { AnimatePresence, motion } from "motion/react"
import { useEffect, useState } from "react"
import { Exit } from "effect"
import { updateUserMutation } from "~/atoms/user-atoms"
import { Button } from "~/components/ui/button"
import { CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Input, InputGroup } from "~/components/ui/input"
import { useAuth } from "~/lib/auth"
import { toastExit } from "~/lib/toast-exit"
import { CityCard } from "../city-card"
import { GlobeVisual } from "../globe-visual"
import { TimeRibbon } from "../time-ribbon"
import { OnboardingNavigation } from "./onboarding-navigation"

const CITIES = [
	// Americas
	{ name: "New York", timezone: "America/New_York", offset: -5, country: "USA" },
	{ name: "Los Angeles", timezone: "America/Los_Angeles", offset: -8, country: "USA" },
	{ name: "Chicago", timezone: "America/Chicago", offset: -6, country: "USA" },
	{ name: "Toronto", timezone: "America/Toronto", offset: -5, country: "Canada" },
	{ name: "Mexico City", timezone: "America/Mexico_City", offset: -6, country: "Mexico" },
	{ name: "São Paulo", timezone: "America/Sao_Paulo", offset: -3, country: "Brazil" },
	{ name: "Buenos Aires", timezone: "America/Argentina/Buenos_Aires", offset: -3, country: "Argentina" },
	// Europe
	{ name: "London", timezone: "Europe/London", offset: 0, country: "UK" },
	{ name: "Paris", timezone: "Europe/Paris", offset: 1, country: "France" },
	{ name: "Berlin", timezone: "Europe/Berlin", offset: 1, country: "Germany" },
	{ name: "Amsterdam", timezone: "Europe/Amsterdam", offset: 1, country: "Netherlands" },
	{ name: "Moscow", timezone: "Europe/Moscow", offset: 3, country: "Russia" },
	{ name: "Istanbul", timezone: "Europe/Istanbul", offset: 3, country: "Turkey" },
	// Africa & Middle East
	{ name: "Cairo", timezone: "Africa/Cairo", offset: 2, country: "Egypt" },
	{ name: "Dubai", timezone: "Asia/Dubai", offset: 4, country: "UAE" },
	{ name: "Lagos", timezone: "Africa/Lagos", offset: 1, country: "Nigeria" },
	{ name: "Johannesburg", timezone: "Africa/Johannesburg", offset: 2, country: "South Africa" },
	// Asia
	{ name: "Mumbai", timezone: "Asia/Kolkata", offset: 5.5, country: "India" },
	{ name: "Bangkok", timezone: "Asia/Bangkok", offset: 7, country: "Thailand" },
	{ name: "Singapore", timezone: "Asia/Singapore", offset: 8, country: "Singapore" },
	{ name: "Hong Kong", timezone: "Asia/Hong_Kong", offset: 8, country: "China" },
	{ name: "Tokyo", timezone: "Asia/Tokyo", offset: 9, country: "Japan" },
	{ name: "Seoul", timezone: "Asia/Seoul", offset: 9, country: "South Korea" },
	// Oceania
	{ name: "Sydney", timezone: "Australia/Sydney", offset: 11, country: "Australia" },
	{ name: "Auckland", timezone: "Pacific/Auckland", offset: 13, country: "New Zealand" },
]

interface TimezoneSelectionStepProps {
	onBack: () => void
	onContinue: (data: { timezone: string }) => void
	defaultTimezone?: string
}

export function TimezoneSelectionStep({ onBack, onContinue, defaultTimezone }: TimezoneSelectionStepProps) {
	const { user } = useAuth()
	const updateUser = useAtomSet(updateUserMutation, { mode: "promiseExit" })

	const [selectedTimezone, setSelectedTimezone] = useState<string | null>(defaultTimezone || null)
	const [detectedTimezone, setDetectedTimezone] = useState<string | null>(null)
	const [searchQuery, setSearchQuery] = useState("")
	const [hoveredOffset, setHoveredOffset] = useState<number | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [detectionAttempted, setDetectionAttempted] = useState(false)

	useEffect(() => {
		const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
		setDetectedTimezone(tz)
		// Auto-select detected timezone if no default
		if (!defaultTimezone) {
			const detectedCity = CITIES.find((c) => c.timezone === tz)
			if (detectedCity) {
				setSelectedTimezone(detectedCity.timezone)
			} else {
				const closest = findClosestCity(tz)
				if (closest) {
					setSelectedTimezone(closest.timezone)
				}
			}
		}
	}, [defaultTimezone])

	const filteredCities = CITIES.filter(
		(city) =>
			city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			city.country.toLowerCase().includes(searchQuery.toLowerCase()),
	)

	const selectedCity = CITIES.find((c) => c.timezone === selectedTimezone)
	const detectedCity = CITIES.find((c) => c.timezone === detectedTimezone)
	const closestCityToDetected = !detectedCity && detectedTimezone ? findClosestCity(detectedTimezone) : null

	function findClosestCity(tz: string): (typeof CITIES)[0] | null {
		try {
			const now = new Date()
			const formatter = new Intl.DateTimeFormat("en-US", {
				timeZone: tz,
				hour: "numeric",
				hourCycle: "h23",
			})
			const localHour = Number.parseInt(formatter.format(now))
			const utcHour = now.getUTCHours()
			let detectedOffset = localHour - utcHour
			if (detectedOffset > 12) detectedOffset -= 24
			if (detectedOffset < -12) detectedOffset += 24

			const firstCity = CITIES[0]
			if (!firstCity) return null

			return CITIES.reduce((closest, city) => {
				const currentDiff = Math.abs(city.offset - detectedOffset)
				const closestDiff = Math.abs(closest.offset - detectedOffset)
				return currentDiff < closestDiff ? city : closest
			}, firstCity)
		} catch {
			return null
		}
	}

	const matchedTimezone = detectedCity?.timezone || closestCityToDetected?.timezone

	const handleDetect = () => {
		setDetectionAttempted(true)
		if (detectedCity) {
			setSelectedTimezone(detectedCity.timezone)
		} else if (closestCityToDetected) {
			setSelectedTimezone(closestCityToDetected.timezone)
		}
	}

	const handleContinue = async () => {
		if (!selectedTimezone || !user?.id) return

		setIsSubmitting(true)

		const exit = await toastExit(
			updateUser({
				payload: {
					id: user.id,
					timezone: selectedTimezone,
				},
			}),
			{
				loading: "Saving timezone...",
				success: "Timezone saved",
				customErrors: {
					UserNotFoundError: () => ({
						title: "User not found",
						description: "Your account could not be found. Please try signing in again.",
						isRetryable: false,
					}),
				},
			},
		)

		setIsSubmitting(false)

		if (Exit.isSuccess(exit)) {
			onContinue({ timezone: selectedTimezone })
		}
	}

	return (
		<div className="space-y-6">
			<CardHeader>
				<CardTitle>Where are you located?</CardTitle>
				<CardDescription>
					Your teammates will see your local time, making it easier to communicate across time zones
				</CardDescription>
			</CardHeader>

			<div className="rounded-2xl overflow-hidden">
				{/* Globe and Time Ribbon Section */}
				<div className="relative bg-gradient-to-b from-muted/50 to-transparent p-6 pb-4 rounded-2xl border border-border">
					<GlobeVisual
						selectedOffset={selectedCity?.offset ?? null}
						hoveredOffset={hoveredOffset}
					/>
					<TimeRibbon
						selectedOffset={selectedCity?.offset ?? null}
						onHover={setHoveredOffset}
						onSelect={(offset) => {
							const city = CITIES.find((c) => c.offset === offset)
							if (city) setSelectedTimezone(city.timezone)
						}}
					/>
				</div>

				{/* Search and Detection */}
				<div className="py-4 flex flex-col sm:flex-row gap-3">
					<InputGroup className="w-full">
						<IconMagnifier3 />
						<Input
							placeholder="Search cities..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</InputGroup>
					<Button
						intent={
							detectionAttempted && matchedTimezone === selectedTimezone ? "primary" : "outline"
						}
						onPress={handleDetect}
						className="gap-2 shrink-0"
					>
						<IconMapPin className="size-4" />
						{detectionAttempted && matchedTimezone === selectedTimezone
							? `Detected: ${detectedCity?.name || closestCityToDetected?.name}`
							: "Detect My Timezone"}
					</Button>
				</div>

				{/* City Cards Grid */}
				<div className="py-6 @container">
					<div className="grid grid-cols-1 @xs:grid-cols-2 @md:grid-cols-3 @lg:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto p-1 -m-1 pr-2">
						{filteredCities.map((city, index) => (
							<CityCard
								key={city.timezone}
								city={city}
								isSelected={selectedTimezone === city.timezone}
								isDetected={city.timezone === matchedTimezone}
								onClick={() => setSelectedTimezone(city.timezone)}
								onHover={(isHovered) => setHoveredOffset(isHovered ? city.offset : null)}
								index={index}
							/>
						))}
					</div>
				</div>
			</div>

			<OnboardingNavigation
				onBack={onBack}
				onContinue={handleContinue}
				canContinue={!!selectedTimezone}
				isLoading={isSubmitting}
			/>
		</div>
	)
}
