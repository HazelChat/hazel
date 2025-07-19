// duo-solid/general
import type { Component, JSX } from "solid-js"

export const IconToggleOnDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M9.903 4a8 8 0 1 0 0 16h6a8 8 0 0 0 0-16z"
				clip-rule="evenodd"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M15.903 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z"
				clip-rule="evenodd"
			/>
		</svg>
	)
}

export default IconToggleOnDuoSolid
