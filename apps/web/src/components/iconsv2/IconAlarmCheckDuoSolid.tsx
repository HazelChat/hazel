// duo-solid/time
import type { Component, JSX } from "solid-js"

export const IconAlarmCheckDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path fill="currentColor" d="M12 4a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z" opacity=".28" />
			<path fill="currentColor" d="M5.707 3.707a1 1 0 0 0-1.414-1.414l-3 3a1 1 0 0 0 1.414 1.414z" />
			<path fill="currentColor" d="M19.707 2.293a1 1 0 1 0-1.414 1.414l3 3a1 1 0 1 0 1.414-1.414z" />
			<path
				fill="currentColor"
				d="M15.564 11.826a1 1 0 1 0-1.128-1.652 14.2 14.2 0 0 0-3.603 3.53l-1.126-1.126a1 1 0 1 0-1.414 1.415l2.007 2.004a1 1 0 0 0 1.575-.21 12.06 12.06 0 0 1 3.689-3.961Z"
			/>
		</svg>
	)
}

export default IconAlarmCheckDuoSolid
