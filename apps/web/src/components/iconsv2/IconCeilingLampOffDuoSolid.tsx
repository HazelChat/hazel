// duo-solid/appliances
import type { Component, JSX } from "solid-js"

export const IconCeilingLampOffDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill="currentColor"
				d="M3 17h18a1 1 0 0 0 1-1c0-5.523-4.477-10-10-10S2 10.477 2 16a1 1 0 0 0 1 1Z"
				opacity=".28"
			/>
			<path fill="currentColor" d="M13 4a1 1 0 0 0-2 0v2.05a10 10 0 0 1 2 0z" />
			<path fill="currentColor" d="M8.126 17a4.002 4.002 0 0 0 7.748 0h-2.142a2 2 0 0 1-3.464 0z" />
		</svg>
	)
}

export default IconCeilingLampOffDuoSolid
