// duo-stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowBigDownDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M19 14.196q-1.995.231-4 .33V4.603c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437c-.214-.11-.494-.11-1.054-.11h-2.8c-.56 0-.84 0-1.054.11a1 1 0 0 0-.437.437C9 3.763 9 4.043 9 4.603v9.923a61 61 0 0 1-4-.33"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M19 14.195a35.3 35.3 0 0 1-6.307 6.558 1.11 1.11 0 0 1-1.386 0A35.3 35.3 0 0 1 5 14.195"
				fill="none"
			/>
		</svg>
	)
}

export default IconArrowBigDownDuoStroke
