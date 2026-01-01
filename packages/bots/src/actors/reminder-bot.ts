/**
 * Reminder Bot Actor
 *
 * A Rivet actor that manages reminders for an organization.
 * Each organization gets its own actor instance.
 * Uses Effect for all actions.
 */

import { Duration, Effect } from "effect"
import { actor } from "rivetkit"
import * as Action from "../effect/actor.ts"

export interface Reminder {
	id: string
	userId: string
	channelId: string
	message: string
	dueAt: number
	createdAt: number
}

export interface ReminderBotState {
	orgId: string
	reminders: Reminder[]
}

export interface ReminderBotInput {
	orgId: string
}

export interface RemindArgs {
	userId: string
	channelId: string
	time: string
	message: string
}

export interface RemindersArgs {
	userId: string
}

export interface CancelReminderArgs {
	reminderId: string
	userId: string
}

export interface FireReminderArgs {
	reminderId: string
}

// Actor context type with state and schedule
interface ReminderBotContext {
	state: ReminderBotState
	schedule: {
		at: (time: number, action: string, args: Record<string, unknown>) => void
	}
}

// Backend URL for API calls
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3000"

/**
 * Post a message to a channel via the backend API
 */
const postBotMessage = (botId: string, orgId: string, channelId: string, content: string) =>
	Effect.tryPromise({
		try: () =>
			fetch(`${BACKEND_URL}/api/bots/${botId}/messages`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ orgId, channelId, content }),
			}).then((res) => {
				if (!res.ok) throw new Error(`Failed to post message: ${res.status}`)
				return res.json()
			}),
		catch: (e) => new Error(`Failed to post bot message: ${e}`),
	})

/**
 * Parse reminder time string into milliseconds
 * Supports: 5s, 5m, 1h, 2d
 */
function parseReminderTime(input: string): Duration.Duration | null {
	const match = input.match(/^(\d+)(s|m|h|d)$/)
	if (!match) return null

	const [, amount, unit] = match
	const num = Number.parseInt(amount, 10)

	switch (unit) {
		case "s":
			return Duration.seconds(num)
		case "m":
			return Duration.minutes(num)
		case "h":
			return Duration.hours(num)
		case "d":
			return Duration.days(num)
		default:
			return null
	}
}

/**
 * Format duration for display
 */
function formatDuration(dueAt: number): string {
	const now = Date.now()
	const diff = dueAt - now
	if (diff <= 0) return "now"

	const seconds = Math.floor(diff / 1000)
	const minutes = Math.floor(seconds / 60)
	const hours = Math.floor(minutes / 60)
	const days = Math.floor(hours / 24)

	if (days > 0) return `${days}d ${hours % 24}h`
	if (hours > 0) return `${hours}h ${minutes % 60}m`
	if (minutes > 0) return `${minutes}m`
	return `${seconds}s`
}

export const reminderBot = actor({
	// Initialize with per-org state
	createState: (_c, input: ReminderBotInput): ReminderBotState => ({
		orgId: input.orgId,
		reminders: [],
	}),

	actions: {
		/**
		 * Create a reminder
		 * Parses time string and schedules the reminder to fire
		 */
		remind: Action.effect(function* (c, args: RemindArgs) {
			const duration = parseReminderTime(args.time)
			if (!duration) {
				return {
					success: false,
					error: "Invalid time format. Use: 5s, 5m, 1h, 2d",
				}
			}

			const delayMs = Duration.toMillis(duration)
			const dueAt = Date.now() + delayMs
			const reminder: Reminder = {
				id: crypto.randomUUID(),
				userId: args.userId,
				channelId: args.channelId,
				message: args.message,
				dueAt,
				createdAt: Date.now(),
			}

			yield* Action.updateState(c, (state) => {
				state.reminders.push(reminder)
			})

			c.schedule.at(dueAt, "fireReminder", { reminderId: reminder.id })

			return {
				success: true,
				reminderId: reminder.id,
				responseMessage: `Got it! I'll remind you in ${args.time}.`,
				dueAt,
			}
		}),

		/**
		 * List user's pending reminders
		 */
		reminders: Action.effect(function* (c, args: RemindersArgs) {
			const s = yield* Action.state(c)
			const pending = s.reminders.filter((r) => r.userId === args.userId && r.dueAt > Date.now())

			if (pending.length === 0) {
				return {
					reminders: [],
					responseMessage: "You have no active reminders.",
				}
			}

			const list = pending.map((r, i) => `${i + 1}. "${r.message}" - in ${formatDuration(r.dueAt)}`).join("\n")

			return {
				reminders: pending,
				responseMessage: `Your reminders:\n${list}`,
			}
		}),

		/**
		 * Cancel a reminder
		 */
		cancelReminder: Action.effect(function* (c, args: CancelReminderArgs) {
			const s = yield* Action.state(c)
			const idx = s.reminders.findIndex((r) => r.id === args.reminderId && r.userId === args.userId)
			if (idx === -1) {
				return { success: false, error: "Reminder not found" }
			}

			yield* Action.updateState(c, (state) => {
				state.reminders.splice(idx, 1)
			})

			return { success: true, responseMessage: "Reminder cancelled." }
		}),

		/**
		 * Scheduled action - fires when reminder is due
		 * Posts message to channel via backend API
		 */
		fireReminder: Action.effect(function* (c, args: FireReminderArgs) {
			const s = yield* Action.state(c)
			const reminder = s.reminders.find((r) => r.id === args.reminderId)
			if (!reminder) {
				return { fired: false }
			}

			// Remove from state
			yield* Action.updateState(c, (state) => {
				state.reminders = state.reminders.filter((r) => r.id !== args.reminderId)
			})

			// Post message to channel via backend API
			yield* postBotMessage(
				"reminder-bot",
				s.orgId,
				reminder.channelId,
				`**Reminder** <@${reminder.userId}>: ${reminder.message}`,
			).pipe(Effect.catchAll((e) => Effect.logError("Failed to post reminder message", e)))

			return {
				fired: true,
				reminder,
			}
		}),

		/**
		 * Get the org ID for this actor
		 */
		getOrgId: Action.effect(function* (c, _args: unknown) {
			const s = yield* Action.state(c)
			return s.orgId
		}),

		/**
		 * Get all reminders (for debugging)
		 */
		getAllReminders: Action.effect(function* (c, _args: unknown) {
			const s = yield* Action.state(c)
			return s.reminders
		}),
	},
})

export type ReminderBotActor = typeof reminderBot
