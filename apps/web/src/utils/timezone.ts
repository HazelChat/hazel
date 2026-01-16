/**
 * Timezone utilities for formatting and displaying user timezones
 */

export interface TimezoneOption {
	id: string
	label: string
	offset: string
}

/**
 * Get all available IANA timezones with formatted labels
 */
export function getTimezones(): TimezoneOption[] {
	const timezones = Intl.supportedValuesOf("timeZone")
	return timezones.map((tz) => {
		const now = new Date()
		const formatter = new Intl.DateTimeFormat("en-US", {
			timeZone: tz,
			timeZoneName: "shortOffset",
		})
		const parts = formatter.formatToParts(now)
		const offset = parts.find((p) => p.type === "timeZoneName")?.value || ""

		// Format: "America/New_York" -> "New York"
		const cityName = tz.split("/").pop()?.replace(/_/g, " ") || tz

		return {
			id: tz,
			label: `${cityName} (${offset})`,
			offset,
		}
	})
}

/**
 * Formats a user's local time based on their timezone
 * @returns "3:45 PM"
 */
export function formatUserLocalTime(timezone: string | null | undefined): string {
	if (!timezone) return ""

	try {
		const now = new Date()
		const formatter = new Intl.DateTimeFormat("en-US", {
			timeZone: timezone,
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		})

		return formatter.format(now)
	} catch {
		return ""
	}
}

/**
 * Gets the timezone abbreviation (e.g., "PST", "EST", "GMT-5")
 */
export function getTimezoneAbbreviation(timezone: string | null | undefined): string {
	if (!timezone) return ""

	try {
		const formatter = new Intl.DateTimeFormat("en-US", {
			timeZone: timezone,
			timeZoneName: "short",
		})
		const parts = formatter.formatToParts(new Date())
		return parts.find((p) => p.type === "timeZoneName")?.value || ""
	} catch {
		return ""
	}
}

/**
 * Gets the UTC offset string (e.g., "GMT-8", "GMT+5:30")
 */
export function getTimezoneOffset(timezone: string | null | undefined): string {
	if (!timezone) return ""

	try {
		const formatter = new Intl.DateTimeFormat("en-US", {
			timeZone: timezone,
			timeZoneName: "shortOffset",
		})
		const parts = formatter.formatToParts(new Date())
		return parts.find((p) => p.type === "timeZoneName")?.value || ""
	} catch {
		return ""
	}
}

/**
 * Detect the user's browser timezone
 */
export function detectBrowserTimezone(): string {
	return Intl.DateTimeFormat().resolvedOptions().timeZone
}

export interface TimezoneCity {
	name: string
	timezone: string
	offset: number
	country: string
}

/**
 * Convert an IANA timezone string to a display-friendly city object
 * e.g., "America/New_York" -> { name: "New York", timezone: "America/New_York", offset: -5, country: "America" }
 */
export function timezoneToCity(timezone: string): TimezoneCity {
	// Extract city name from timezone (e.g., "America/New_York" -> "New York")
	const parts = timezone.split("/")
	const cityPart = parts[parts.length - 1] || timezone
	const name = cityPart.replace(/_/g, " ")

	// Extract region as country (e.g., "America", "Europe", "Asia")
	const country = parts[0]?.replace(/_/g, " ") || ""

	// Calculate current UTC offset
	const offset = getTimezoneOffsetNumber(timezone)

	return {
		name,
		timezone,
		offset,
		country,
	}
}

/**
 * Get the UTC offset as a number (e.g., -5 for EST, 5.5 for IST)
 */
export function getTimezoneOffsetNumber(timezone: string): number {
	try {
		const now = new Date()
		const formatter = new Intl.DateTimeFormat("en-US", {
			timeZone: timezone,
			hour: "numeric",
			minute: "numeric",
			hourCycle: "h23",
		})
		const parts = formatter.formatToParts(now)
		const hour = Number.parseInt(parts.find((p) => p.type === "hour")?.value || "0")
		const minute = Number.parseInt(parts.find((p) => p.type === "minute")?.value || "0")

		const utcHour = now.getUTCHours()
		const utcMinute = now.getUTCMinutes()

		let hourDiff = hour - utcHour
		const minuteDiff = minute - utcMinute

		// Handle day boundary
		if (hourDiff > 12) hourDiff -= 24
		if (hourDiff < -12) hourDiff += 24

		return hourDiff + minuteDiff / 60
	} catch {
		return 0
	}
}

/**
 * Pre-computed list of all IANA timezones for fast searching
 * Offset is set to 0 as placeholder - calculate on demand when displaying
 */
const ALL_TIMEZONES_CACHED: TimezoneCity[] = Intl.supportedValuesOf("timeZone").map((tz) => {
	const parts = tz.split("/")
	const cityPart = parts[parts.length - 1] || tz
	return {
		name: cityPart.replace(/_/g, " "),
		timezone: tz,
		offset: 0, // Placeholder - use getTimezoneOffsetNumber() when displaying
		country: parts[0]?.replace(/_/g, " ") || "",
	}
})

/**
 * Get all IANA timezones as city objects for display (cached, fast)
 * Note: offset values are placeholders - use getTimezoneOffsetNumber() for actual offset
 */
export function getAllTimezoneCities(): TimezoneCity[] {
	return ALL_TIMEZONES_CACHED
}
