// solid/time
import type { Component, JSX } from "solid-js"

export const IconTimerOff: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path
				d="M9 2a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2h-1v2.055a8.95 8.95 0 0 1 3.425 1.106l4.868-4.868a1 1 0 1 1 1.414 1.414l-20 20a1 1 0 0 1-1.414-1.414l2.868-2.868A9 9 0 0 1 11 5.055V3h-1a1 1 0 0 1-1-1Z"
				fill="currentColor"
			/>
			<path
				d="M19.345 9.485a1 1 0 0 1 .734.545A9 9 0 0 1 8.03 22.08a1 1 0 0 1-.265-1.604l10.71-10.71a1 1 0 0 1 .87-.28Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconTimerOff
