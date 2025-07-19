// duo-stroke/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconTiktokDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M13.989 2v15.556a4.444 4.444 0 1 1-4.444-4.445"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m13.989 2 .85 1.912a6.28 6.28 0 0 0 4.705 3.644"
				fill="none"
			/>
		</svg>
	)
}

export default IconTiktokDuoStroke
