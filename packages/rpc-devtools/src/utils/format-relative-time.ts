const DIVISIONS = [
	{ amount: 60, name: "seconds" },
	{ amount: 60, name: "minutes" },
	{ amount: 24, name: "hours" },
	{ amount: 7, name: "days" },
	{ amount: 4.34524, name: "weeks" },
	{ amount: 12, name: "months" },
	{ amount: Number.POSITIVE_INFINITY, name: "years" },
] as const

const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

export function formatRelativeTime(date: Date | number): string {
	const timestamp = typeof date === "number" ? date : date.getTime()
	let duration = (timestamp - Date.now()) / 1000

	for (const division of DIVISIONS) {
		if (Math.abs(duration) < division.amount) {
			return formatter.format(Math.round(duration), division.name as Intl.RelativeTimeFormatUnit)
		}
		duration /= division.amount
	}

	return formatter.format(Math.round(duration), "years")
}
