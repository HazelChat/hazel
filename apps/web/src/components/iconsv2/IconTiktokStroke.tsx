// stroke/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconTiktokStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M19.545 7.556a6.28 6.28 0 0 1-4.706-3.644L13.989 2v15.556a4.444 4.444 0 1 1-4.444-4.445"
				fill="none"
			/>
		</svg>
	)
}

export default IconTiktokStroke
