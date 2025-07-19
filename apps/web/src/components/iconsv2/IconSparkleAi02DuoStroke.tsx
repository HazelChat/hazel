// duo-stroke/general
import type { Component, JSX } from "solid-js"

export const IconSparkleAi02DuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M5.7 3c.248 1.506 1.151 2.445 2.7 2.7-1.549.255-2.452 1.194-2.7 2.7C5.452 6.894 4.548 5.955 3 5.7 4.506 5.452 5.445 4.548 5.7 3Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12.9 3c.64 5.037 2.63 8.142 8.1 9-5.19.814-7.43 3.728-8.1 9-.67-5.272-2.91-8.186-8.1-9 5.19-.814 7.43-3.728 8.1-9Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconSparkleAi02DuoStroke
