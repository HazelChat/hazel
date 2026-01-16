import IconMagnifier3 from "~/components/icons/icon-magnifier-3"
import { IconMapPin } from "~/components/icons/icon-map-pin"
import { useAtomSet } from "@effect-atom/atom-react"
import { useEffect, useMemo, useState } from "react"
import { Exit } from "effect"
import { updateUserMutation } from "~/atoms/user-atoms"
import { Button } from "~/components/ui/button"
import { CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Input, InputGroup } from "~/components/ui/input"
import { useAuth } from "~/lib/auth"
import { toastExitOnError } from "~/lib/toast-exit"
import {
	getAllTimezoneCities,
	getTimezoneOffsetNumber,
	timezoneToCity,
	type TimezoneCity,
} from "~/utils/timezone"
import { CityCard } from "../city-card"
import { GlobeVisual } from "../globe-visual"
import { TimeRibbon } from "../time-ribbon"
import { OnboardingNavigation } from "./onboarding-navigation"

const CITIES = [
	// Americas & Pacific
	{ name: "Pago Pago", timezone: "Pacific/Pago_Pago", offset: -11, country: "American Samoa" },
	{ name: "Honolulu", timezone: "Pacific/Honolulu", offset: -10, country: "USA" },
	{ name: "Anchorage", timezone: "America/Anchorage", offset: -9, country: "USA" },
	{ name: "Los Angeles", timezone: "America/Los_Angeles", offset: -8, country: "USA" },
	{ name: "Denver", timezone: "America/Denver", offset: -7, country: "USA" },
	{ name: "Chicago", timezone: "America/Chicago", offset: -6, country: "USA" },
	{ name: "New York", timezone: "America/New_York", offset: -5, country: "USA" },
	{ name: "Santiago", timezone: "America/Santiago", offset: -4, country: "Chile" },
	{ name: "São Paulo", timezone: "America/Sao_Paulo", offset: -3, country: "Brazil" },
	{ name: "Buenos Aires", timezone: "America/Argentina/Buenos_Aires", offset: -3, country: "Argentina" },
	{ name: "Toronto", timezone: "America/Toronto", offset: -5, country: "Canada" },
	{ name: "Mexico City", timezone: "America/Mexico_City", offset: -6, country: "Mexico" },
	// Europe & Atlantic
	{ name: "Azores", timezone: "Atlantic/Azores", offset: -1, country: "Portugal" },
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
	{ name: "Karachi", timezone: "Asia/Karachi", offset: 5, country: "Pakistan" },
	{ name: "Mumbai", timezone: "Asia/Kolkata", offset: 5.5, country: "India" },
	{ name: "Dhaka", timezone: "Asia/Dhaka", offset: 6, country: "Bangladesh" },
	{ name: "Bangkok", timezone: "Asia/Bangkok", offset: 7, country: "Thailand" },
	{ name: "Singapore", timezone: "Asia/Singapore", offset: 8, country: "Singapore" },
	{ name: "Hong Kong", timezone: "Asia/Hong_Kong", offset: 8, country: "China" },
	{ name: "Tokyo", timezone: "Asia/Tokyo", offset: 9, country: "Japan" },
	{ name: "Seoul", timezone: "Asia/Seoul", offset: 9, country: "South Korea" },
	// Oceania & Pacific
	{ name: "Brisbane", timezone: "Australia/Brisbane", offset: 10, country: "Australia" },
	{ name: "Sydney", timezone: "Australia/Sydney", offset: 11, country: "Australia" },
	{ name: "Fiji", timezone: "Pacific/Fiji", offset: 12, country: "Fiji" },
	{ name: "Auckland", timezone: "Pacific/Auckland", offset: 12, country: "New Zealand" },
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
	const [debouncedQuery, setDebouncedQuery] = useState("")
	const [hoveredOffset, setHoveredOffset] = useState<number | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [detectionAttempted, setDetectionAttempted] = useState(false)

	// Get all IANA timezones (cached, fast)
	const allTimezones = useMemo(() => getAllTimezoneCities(), [])

	// Debounce search query for performance
	useEffect(() => {
		const timer = setTimeout(() => setDebouncedQuery(searchQuery), 150)
		return () => clearTimeout(timer)
	}, [searchQuery])

	// Auto-detect timezone on mount
	useEffect(() => {
		const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
		setDetectedTimezone(tz)
		// Auto-select detected timezone if no default
		if (!defaultTimezone) {
			setSelectedTimezone(tz)
		}
	}, [defaultTimezone])

	// Get city object for detected timezone (may not be in CITIES)
	const detectedCity = useMemo(() => {
		if (!detectedTimezone) return null
		const fromCities = CITIES.find((c) => c.timezone === detectedTimezone)
		if (fromCities) return fromCities
		return timezoneToCity(detectedTimezone)
	}, [detectedTimezone])

	// Get city object for selected timezone
	const selectedCity = useMemo(() => {
		if (!selectedTimezone) return null
		const fromCities = CITIES.find((c) => c.timezone === selectedTimezone)
		if (fromCities) return fromCities
		return timezoneToCity(selectedTimezone)
	}, [selectedTimezone])

	// Filter cities based on search query (debounced for performance)
	const filteredCities = useMemo(() => {
		const query = debouncedQuery.toLowerCase().trim()

		if (!query) {
			// No search: show curated cities, plus detected if not already included
			const result = [...CITIES]
			if (detectedCity && !CITIES.some((c) => c.timezone === detectedCity.timezone)) {
				result.unshift(detectedCity)
			}
			return result
		}

		// Search through ALL timezones (cached list, fast)
		const matches = allTimezones.filter(
			(city) =>
				city.name.toLowerCase().includes(query) ||
				city.country.toLowerCase().includes(query) ||
				city.timezone.toLowerCase().includes(query),
		)

		// Sort: detected timezone first, then by name
		const sorted = matches.sort((a, b) => {
			if (a.timezone === detectedTimezone) return -1
			if (b.timezone === detectedTimezone) return 1
			return a.name.localeCompare(b.name)
		})

		// Limit results and calculate offset on demand for displayed items only
		return sorted.slice(0, 30).map((city) => ({
			...city,
			offset: getTimezoneOffsetNumber(city.timezone),
		}))
	}, [debouncedQuery, allTimezones, detectedTimezone, detectedCity])

	const handleDetect = () => {
		setDetectionAttempted(true)
		if (detectedTimezone) {
			setSelectedTimezone(detectedTimezone)
		}
	}

	const handleContinue = async () => {
		if (!selectedTimezone || !user?.id) return

		setIsSubmitting(true)

		const exit = await updateUser({
			payload: {
				id: user.id,
				timezone: selectedTimezone,
			},
		})
		toastExitOnError(exit, {
			customErrors: {
				UserNotFoundError: () => ({
					title: "User not found",
					description: "Your account could not be found. Please try signing in again.",
					isRetryable: false,
				}),
			},
		})

		setIsSubmitting(false)

		if (Exit.isSuccess(exit)) {
			onContinue({ timezone: selectedTimezone })
		}
	}

	return (
		<div data-testid="onboarding-step-timezone" className="space-y-4 sm:space-y-6 pb-16 sm:pb-0">
			<CardHeader>
				<CardTitle>Where are you located?</CardTitle>
				<CardDescription>
					Your teammates will see your local time, making it easier to communicate across time zones
				</CardDescription>
			</CardHeader>

			<div className="rounded-2xl overflow-hidden">
				{/* Globe and Time Ribbon Section */}
				<div className="relative bg-gradient-to-b from-muted/50 to-transparent p-4 pb-3 rounded-2xl border border-border sm:p-6 sm:pb-4">
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
							placeholder="Search all timezones..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</InputGroup>
					<Button
						intent={
							detectionAttempted && detectedTimezone === selectedTimezone
								? "primary"
								: "outline"
						}
						onPress={handleDetect}
						className="gap-2 shrink-0"
					>
						<IconMapPin className="size-4" />
						{detectionAttempted && detectedTimezone === selectedTimezone
							? `Detected: ${detectedCity?.name}`
							: "Detect My Timezone"}
					</Button>
				</div>

				{/* City Cards Grid */}
				<div className="py-4 sm:py-6 @container">
					<div className="grid grid-cols-1 @xs:grid-cols-2 @md:grid-cols-3 @lg:grid-cols-4 gap-3 max-h-[250px] sm:max-h-[400px] overflow-y-auto p-3 -m-3 pr-4">
						{filteredCities.map((city) => (
							<CityCard
								key={city.timezone}
								city={city}
								isSelected={selectedTimezone === city.timezone}
								isDetected={city.timezone === detectedTimezone}
								onClick={() => setSelectedTimezone(city.timezone)}
								onHover={(isHovered) => setHoveredOffset(isHovered ? city.offset : null)}
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
