// duo-solid/automotive
import type { Component, JSX } from "solid-js"

export const IconCyberTruckDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M10.233 6.028a1 1 0 0 0-.719.098l-9 5A1 1 0 0 0 0 12v3a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h8a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h2a1 1 0 0 0 .995-.9l.5-5a1 1 0 0 0-.762-1.072z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M6 12a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-1 3a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"
				clip-rule="evenodd"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M18 12a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-1 3a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"
				clip-rule="evenodd"
			/>
		</svg>
	)
}

export default IconCyberTruckDuoSolid
