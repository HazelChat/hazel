// duo-solid/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconAmieSoDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M8.21 2a6.21 6.21 0 0 0-4.92 10A6.21 6.21 0 0 0 12 20.71 6.21 6.21 0 0 0 20.71 12 6.21 6.21 0 0 0 12 3.29 6.2 6.2 0 0 0 8.21 2Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M11 14v-4a1 1 0 1 1 2 0v4a1 1 0 1 1-2 0Z"
			/>
		</svg>
	)
}

export default IconAmieSoDuoSolid
