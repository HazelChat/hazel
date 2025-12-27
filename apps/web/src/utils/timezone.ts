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
