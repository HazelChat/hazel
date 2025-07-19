// duo-stroke/general
import type { Component, JSX } from "solid-js"

export const IconListCheckDoubleDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 12h9m-9 6h9M12 6h9"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M3 8.105 4.897 10a12.14 12.14 0 0 1 3.694-4M3 16.105 4.897 18a12.14 12.14 0 0 1 3.694-4"
				fill="none"
			/>
		</svg>
	)
}

export default IconListCheckDoubleDuoStroke
