import { Match } from "effect"

export function getOnboardingImage() {
	const now = new Date()
	const month = now.getMonth() // 0-11
	const hour = now.getHours() // 0-23

	// Determine season based on month
	const season = Match.value(month).pipe(
		Match.when(
			(m) => m >= 2 && m <= 4,
			() => "spring" as const,
		), // Mar-May
		Match.when(
			(m) => m >= 5 && m <= 7,
			() => "summer" as const,
		), // Jun-Aug
		Match.when(
			(m) => m >= 8 && m <= 10,
			() => "autumn" as const,
		), // Sep-Nov
		Match.orElse(() => "winter" as const), // Dec-Feb
	)

	// Determine time of day (day = 6AM-6PM, night = 6PM-6AM)
	const timeOfDay = Match.value(hour).pipe(
		Match.when(
			(h) => h >= 6 && h < 18,
			() => "day" as const,
		),
		Match.orElse(() => "night" as const),
	)

	return `/images/onboarding/${season}-${timeOfDay}.webp`
}
