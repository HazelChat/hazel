import { WEBHOOK_BOT_CONFIGS } from "../common/bot-configs.ts"
import type { MessageEmbed, MessageEmbedField } from "../common/embed-types.ts"
import { formatSignalType, getMapleEventStyle, severityIntent } from "./colors.ts"
import type { MapleAlertPayload, MapleComparator } from "./payloads.ts"

const mapleConfig = WEBHOOK_BOT_CONFIGS.maple

const COMPARATOR_LABEL: Record<MapleComparator, string> = {
	gt: ">",
	gte: "≥",
	lt: "<",
	lte: "≤",
}

function formatNumber(value: number): string {
	if (!Number.isFinite(value)) return String(value)
	if (Math.abs(value) >= 1000 || Number.isInteger(value)) {
		return value.toLocaleString("en-US", { maximumFractionDigits: 2 })
	}
	return value.toFixed(2)
}

/**
 * Build embed for a Maple alert webhook event.
 * Renders trigger / resolve / renotify / test events with severity-aware coloring.
 */
export function buildMapleEmbed(payload: MapleAlertPayload): MessageEmbed {
	const { eventType, rule, observed, linkUrl, sentAt } = payload
	const style = getMapleEventStyle(eventType, rule.severity)
	const signalLabel = formatSignalType(rule.signalType)

	const title = rule.groupKey ? `${rule.name} — ${rule.groupKey}` : rule.name

	const description =
		eventType === "resolve"
			? `${signalLabel} returned to healthy range.`
			: eventType === "test"
				? `Test alert for ${signalLabel.toLowerCase()}.`
				: `${signalLabel} ${COMPARATOR_LABEL[rule.comparator]} ${formatNumber(rule.threshold)} over ${rule.windowMinutes}m.`

	const fields: MessageEmbedField[] = []

	fields.push({
		name: "Severity",
		value: rule.severity === "critical" ? "Critical" : "Warning",
		type: "badge",
		options: { intent: severityIntent(rule.severity) },
		inline: true,
	})

	fields.push({
		name: "Signal",
		value: signalLabel,
		inline: true,
	})

	if (observed.value !== null) {
		const observedValue = `${formatNumber(observed.value)} (threshold ${COMPARATOR_LABEL[rule.comparator]} ${formatNumber(rule.threshold)})`
		fields.push({
			name: "Observed",
			value: observedValue,
			inline: false,
		})
	}

	fields.push({
		name: "Window",
		value: `${rule.windowMinutes}m`,
		inline: true,
	})

	if (rule.groupKey) {
		fields.push({
			name: "Group",
			value: rule.groupKey,
			inline: true,
		})
	}

	if (observed.sampleCount !== null) {
		fields.push({
			name: "Samples",
			value: String(observed.sampleCount),
			inline: true,
		})
	}

	return {
		title,
		description,
		url: linkUrl,
		color: style.color,
		author: {
			name: "Maple",
			url: "https://maple.dev",
			iconUrl: mapleConfig.avatarUrl,
		},
		footer: {
			text: "Maple Alerts",
			iconUrl: mapleConfig.avatarUrl,
		},
		image: undefined,
		thumbnail: undefined,
		fields: fields.length > 0 ? fields : undefined,
		timestamp: sentAt,
		badge: {
			text: style.label,
			color: style.color,
		},
	}
}
