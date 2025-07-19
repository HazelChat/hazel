// solid/time
import type { Component, JSX } from "solid-js"

export const IconAlarmCheck: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M5.707 2.293a1 1 0 0 1 0 1.414l-3 3a1 1 0 0 1-1.414-1.414l3-3a1 1 0 0 1 1.414 0Z"
				fill="currentColor"
			/>
			<path
				d="M18.293 2.293a1 1 0 0 1 1.414 0l3 3a1 1 0 0 1-1.414 1.414l-3-3a1 1 0 0 1 0-1.414Z"
				fill="currentColor"
			/>
			<path
				fill-rule="evenodd"
				d="M3 13a9 9 0 1 1 18 0 9 9 0 0 1-18 0Zm12.564-1.174a1 1 0 1 0-1.128-1.652 14.2 14.2 0 0 0-3.603 3.53l-1.126-1.126a1 1 0 1 0-1.414 1.415l2.007 2.004a1 1 0 0 0 1.575-.21 12.06 12.06 0 0 1 3.689-3.961Z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconAlarmCheck
