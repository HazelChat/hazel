// duo-stroke/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconRssSimpleDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12.421 20c0-2.212-.902-4.39-2.466-5.954A8.5 8.5 0 0 0 4 11.579"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M4 4a16 16 0 0 1 16 16m-15.59-.421h.011"
				fill="none"
			/>
		</svg>
	)
}

export default IconRssSimpleDuoStroke
