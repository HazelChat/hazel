import { getLocalTimeZone, Time, today, type DateValue } from "@internationalized/date"
import type { TimeValue } from "react-aria-components"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import { DateInput } from "~/components/ui/date-field"
import { DatePicker, DatePickerTrigger } from "~/components/ui/date-picker"
import { Description, Label } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "~/components/ui/modal"
import { Select, SelectContent, SelectItem, SelectTrigger } from "~/components/ui/select"
import { Switch, SwitchLabel } from "~/components/ui/switch"
import { TextField } from "~/components/ui/text-field"
import { TimeField } from "~/components/ui/time-field"
import { usePresence } from "~/hooks/use-presence"
import { EmojiPickerDialog } from "../emoji-picker/emoji-picker-dialog"

type ExpirationOption = "never" | "30min" | "1hr" | "4hr" | "today" | "week" | "custom"

const EXPIRATION_OPTIONS: { id: ExpirationOption; label: string }[] = [
	{ id: "never", label: "Don't clear" },
	{ id: "30min", label: "30 minutes" },
	{ id: "1hr", label: "1 hour" },
	{ id: "4hr", label: "4 hours" },
	{ id: "today", label: "Today" },
	{ id: "week", label: "This week" },
	{ id: "custom", label: "Choose date & time" },
]

const STATUS_PRESETS: { emoji: string; message: string }[] = [
	{ emoji: "📅", message: "In a meeting" },
	{ emoji: "🚗", message: "Commuting" },
	{ emoji: "🤒", message: "Out sick" },
	{ emoji: "🌴", message: "Vacationing" },
	{ emoji: "🏠", message: "Working from home" },
]

function getExpirationDate(
	option: ExpirationOption,
	customDate?: DateValue | null,
	customTime?: TimeValue | null,
): Date | null {
	const now = new Date()

	switch (option) {
		case "never":
			return null
		case "30min":
			return new Date(now.getTime() + 30 * 60 * 1000)
		case "1hr":
			return new Date(now.getTime() + 60 * 60 * 1000)
		case "4hr":
			return new Date(now.getTime() + 4 * 60 * 60 * 1000)
		case "today": {
			const endOfDay = new Date(now)
			endOfDay.setHours(23, 59, 59, 999)
			return endOfDay
		}
		case "week": {
			// End of the week (Sunday 23:59:59)
			const daysUntilSunday = 7 - now.getDay()
			const endOfWeek = new Date(now)
			endOfWeek.setDate(now.getDate() + daysUntilSunday)
			endOfWeek.setHours(23, 59, 59, 999)
			return endOfWeek
		}
		case "custom": {
			if (!customDate || !customTime) return null
			const date = customDate.toDate(getLocalTimeZone())
			date.setHours(customTime.hour, customTime.minute, 0, 0)
			return date
		}
		default:
			return null
	}
}

interface SetStatusModalProps {
	isOpen: boolean
	onOpenChange: (open: boolean) => void
}

export function SetStatusModal({ isOpen, onOpenChange }: SetStatusModalProps) {
	const { statusEmoji, customMessage, suppressNotifications, setCustomStatus, clearCustomStatus } =
		usePresence()

	const [emoji, setEmoji] = useState<string | null>(statusEmoji ?? null)
	const [message, setMessage] = useState(customMessage ?? "")
	const [expiration, setExpiration] = useState<ExpirationOption>("never")
	const [customDate, setCustomDate] = useState<DateValue | null>(null)
	const [customTime, setCustomTime] = useState<TimeValue | null>(null)
	const [pauseNotifications, setPauseNotifications] = useState(suppressNotifications)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const hasExistingStatus = !!(statusEmoji || customMessage)

	// Format custom date/time for display in the select trigger
	const customDateTimeLabel = (() => {
		if (expiration !== "custom" || !customDate || !customTime) return null
		const date = customDate.toDate(getLocalTimeZone())
		date.setHours(customTime.hour, customTime.minute)
		return date.toLocaleString(undefined, {
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
		})
	})()

	const handlePresetClick = (preset: (typeof STATUS_PRESETS)[0]) => {
		setEmoji(preset.emoji)
		setMessage(preset.message)
	}

	const handleSave = async () => {
		setIsSubmitting(true)
		try {
			const expiresAt = getExpirationDate(expiration, customDate, customTime)
			await setCustomStatus(emoji, message || null, expiresAt, pauseNotifications)
			onOpenChange(false)
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleClear = async () => {
		setIsSubmitting(true)
		try {
			await clearCustomStatus()
			setEmoji(null)
			setMessage("")
			setExpiration("never")
			setCustomDate(null)
			setCustomTime(null)
			setPauseNotifications(false)
			onOpenChange(false)
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleClose = () => {
		onOpenChange(false)
	}

	// Reset form when modal opens
	const handleOpenChange = (open: boolean) => {
		if (open) {
			setEmoji(statusEmoji ?? null)
			setMessage(customMessage ?? "")
			setExpiration("never")
			setCustomDate(null)
			setCustomTime(null)
			setPauseNotifications(suppressNotifications)
		}
		onOpenChange(open)
	}

	return (
		<Modal isOpen={isOpen} onOpenChange={handleOpenChange}>
			<ModalContent size="lg">
				<ModalHeader>
					<ModalTitle>Set a status</ModalTitle>
					<Description>Let others know what you're up to.</Description>
				</ModalHeader>

				<ModalBody className="flex flex-col gap-4">
					{/* Emoji + Message Input */}
					<TextField>
						<Label>Status</Label>
						<div className="flex gap-2">
							<EmojiPickerDialog onEmojiSelect={(e) => setEmoji(e.emoji)}>
								<Button
									intent="outline"
									size="md"
									className="min-w-12 text-lg"
									aria-label="Pick an emoji"
								>
									{emoji || "😊"}
								</Button>
							</EmojiPickerDialog>
							<Input
								className="flex-1"
								placeholder="What's your status?"
								value={message}
								onChange={(e) => setMessage(e.target.value)}
								maxLength={255}
							/>
						</div>
					</TextField>

					{/* Expiration Select */}
					<TextField>
						<Label>Clear after</Label>
						<Select
							selectedKey={expiration}
							onSelectionChange={(key) => {
								const option = key as ExpirationOption
								setExpiration(option)
								if (option === "custom" && !customTime) {
									// Default to next hour
									const now = new Date()
									const nextHour = (now.getHours() + 1) % 24
									setCustomTime(new Time(nextHour, 0))
								}
								if (option === "custom" && !customDate) {
									setCustomDate(today(getLocalTimeZone()))
								}
							}}
						>
							<SelectTrigger />
							<SelectContent>
								{EXPIRATION_OPTIONS.map((option) => {
									const label =
										option.id === "custom" && customDateTimeLabel
											? customDateTimeLabel
											: option.label
									return (
										<SelectItem key={option.id} id={option.id} textValue={label}>
											{label}
										</SelectItem>
									)
								})}
							</SelectContent>
						</Select>
					</TextField>

					{/* Custom Date/Time Picker */}
					{expiration === "custom" && (
						<div className="flex gap-3">
							<div className="flex flex-1 flex-col gap-1">
								<Label className="text-muted-fg text-xs">Date</Label>
								<DatePicker
									value={customDate}
									onChange={setCustomDate}
									minValue={today(getLocalTimeZone())}
								>
									<DatePickerTrigger />
								</DatePicker>
							</div>
							<div className="flex flex-col gap-1">
								<Label className="text-muted-fg text-xs">Time</Label>
								<TimeField value={customTime} onChange={setCustomTime}>
									<DateInput />
								</TimeField>
							</div>
						</div>
					)}

					{/* Pause Notifications Toggle */}
					<div className="flex flex-col gap-1">
						<Switch isSelected={pauseNotifications} onChange={setPauseNotifications}>
							<SwitchLabel>Pause notifications</SwitchLabel>
						</Switch>
						<p className="text-muted-fg text-sm">
							Don't receive notifications while this status is set
						</p>
					</div>

					{/* Presets */}
					<div className="flex flex-col gap-2">
						<Label className="text-muted-fg text-xs">Quick presets</Label>
						<div className="flex flex-wrap gap-2">
							{STATUS_PRESETS.map((preset) => (
								<Button
									key={preset.message}
									intent="outline"
									size="sm"
									onPress={() => handlePresetClick(preset)}
									className="gap-1.5"
								>
									<span>{preset.emoji}</span>
									<span>{preset.message}</span>
								</Button>
							))}
						</div>
					</div>
				</ModalBody>

				<ModalFooter className="flex justify-between">
					<div>
						{hasExistingStatus && (
							<Button intent="danger" onPress={handleClear} isDisabled={isSubmitting}>
								Clear status
							</Button>
						)}
					</div>
					<div className="flex gap-2">
						<Button intent="outline" onPress={handleClose}>
							Cancel
						</Button>
						<Button
							intent="primary"
							onPress={handleSave}
							isDisabled={
								isSubmitting ||
								(!emoji && !message) ||
								(expiration === "custom" && (!customDate || !customTime))
							}
						>
							{isSubmitting ? "Saving..." : "Save"}
						</Button>
					</div>
				</ModalFooter>
			</ModalContent>
		</Modal>
	)
}
