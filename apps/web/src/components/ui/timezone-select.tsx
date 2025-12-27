import { useMemo } from "react"
import { getTimezones, type TimezoneOption } from "~/utils/timezone"
import { ComboBox, ComboBoxContent, ComboBoxInput, ComboBoxItem } from "./combo-box"

interface TimezoneSelectProps {
	value?: string | null
	onChange: (timezone: string) => void
	isDisabled?: boolean
	placeholder?: string
	className?: string
}

export function TimezoneSelect({
	value,
	onChange,
	isDisabled,
	placeholder = "Select timezone...",
	className,
}: TimezoneSelectProps) {
	const allTimezones = useMemo(() => getTimezones(), [])

	return (
		<ComboBox
			selectedKey={value}
			onSelectionChange={(key) => key && onChange(String(key))}
			isDisabled={isDisabled}
			className={className}
		>
			<ComboBoxInput placeholder={placeholder} />
			<ComboBoxContent<TimezoneOption> items={allTimezones} className="max-h-60">
				{(item) => (
					<ComboBoxItem id={item.id} textValue={item.label}>
						{item.label}
					</ComboBoxItem>
				)}
			</ComboBoxContent>
		</ComboBox>
	)
}
