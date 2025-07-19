// duo-solid/general
import type { Component, JSX } from "solid-js"

export const IconToggleOffDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill-rule="evenodd"
				d="M15.903 4a8 8 0 0 1 0 16h-6a8 8 0 0 1 0-16z"
				clip-rule="evenodd"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M9.903 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z"
				clip-rule="evenodd"
			/>
		</svg>
	)
}

export default IconToggleOffDuoSolid
