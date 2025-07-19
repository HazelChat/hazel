// duo-stroke/appliances
import type { Component, JSX } from "solid-js"

export const IconCeilingLampOnDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M15 14H9m-6 0a9 9 0 0 1 18 0z"
				opacity=".28"
			/>
			<path fill="currentColor" d="M13 2a1 1 0 1 0-2 0v2.05a10 10 0 0 1 2 0z" />
			<path fill="currentColor" d="M8.126 15a4.002 4.002 0 0 0 7.748 0h-2.141a2 2 0 0 1-3.465 0z" />
			<path fill="currentColor" d="M8.866 19.5a1 1 0 1 0-1.732-1l-.5.866a1 1 0 0 0 1.732 1z" />
			<path fill="currentColor" d="M16.866 18.5a1 1 0 1 0-1.732 1l.5.866a1 1 0 0 0 1.732-1z" />
			<path fill="currentColor" d="M13 20a1 1 0 1 0-2 0v1a1 1 0 1 0 2 0z" />
		</svg>
	)
}

export default IconCeilingLampOnDuoStroke
