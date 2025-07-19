// duo-stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowBigRightDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M14.195 5q.232 1.995.33 4H4.603c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437c-.109.214-.109.494-.109 1.054v2.8c0 .56 0 .84.11 1.054a1 1 0 0 0 .436.437c.214.109.494.109 1.054.109h9.924a61 61 0 0 1-.33 4"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M14.196 5a35.3 35.3 0 0 1 6.557 6.307 1.11 1.11 0 0 1 0 1.386A35.3 35.3 0 0 1 14.196 19"
				fill="none"
			/>
		</svg>
	)
}

export default IconArrowBigRightDuoStroke
