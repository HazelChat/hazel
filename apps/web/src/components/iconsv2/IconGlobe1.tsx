// contrast/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconGlobe1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 21.15a9.15 9.15 0 1 0 0-18.3 9.15 9.15 0 0 0 0 18.3Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M2.85 12h18.3m-18.3 0A9.15 9.15 0 0 0 12 21.15M2.85 12A9.15 9.15 0 0 1 12 2.85M21.15 12A9.15 9.15 0 0 1 12 21.15M21.15 12A9.15 9.15 0 0 0 12 2.85m0 0A14 14 0 0 1 15.66 12 14 14 0 0 1 12 21.15m0-18.3A14 14 0 0 0 8.34 12 14 14 0 0 0 12 21.15"
			/>
		</svg>
	)
}

export default IconGlobe1
