// contrast/general
import type { Component, JSX } from "solid-js"

export const IconHeart1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 21c1 0 10-5.023 10-12.056 0-5.437-6.837-8.282-10-3.517C8.832.653 2 3.502 2 8.944 2 15.977 11 21 12 21Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M2 8.944C2 15.977 11 21 12 21s10-5.023 10-12.056c0-5.437-6.837-8.282-10-3.517C8.832.653 2 3.502 2 8.944Z"
			/>
		</svg>
	)
}

export default IconHeart1
