// duo-stroke/general
import type { Component, JSX } from "solid-js"

export const IconHeartDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 21c1 0 10-5.023 10-12.056 0-5.437-6.837-8.282-10-3.517C8.832.653 2 3.502 2 8.944 2 15.977 11 21 12 21Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M2 8.944C2 3.502 8.832.654 12 5.427c3.162-4.765 10-1.92 10 3.517"
				fill="none"
			/>
		</svg>
	)
}

export default IconHeartDuoStroke
