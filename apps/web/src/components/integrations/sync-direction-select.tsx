import type { ExternalChannelLink } from "@hazel/domain/models"
import { Select, SelectContent, SelectItem, SelectTrigger } from "~/components/ui/select"

type SyncDirection = ExternalChannelLink.SyncDirection

const DIRECTIONS = [
	{ id: "bidirectional" as const, label: "↔ Two-way" },
	{ id: "inbound" as const, label: "→ Discord to Hazel" },
	{ id: "outbound" as const, label: "← Hazel to Discord" },
]

interface SyncDirectionSelectProps {
	value: SyncDirection
	onChange: (direction: SyncDirection) => void
	isDisabled?: boolean
}

export function SyncDirectionSelect({ value, onChange, isDisabled }: SyncDirectionSelectProps) {
	return (
		<Select
			selectedKey={value}
			onSelectionChange={(key) => onChange(key as SyncDirection)}
			isDisabled={isDisabled}
		>
			<SelectTrigger className="w-44" />
			<SelectContent>
				{DIRECTIONS.map((dir) => (
					<SelectItem key={dir.id} id={dir.id}>
						{dir.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
}
