// stroke/time
import type { Component, JSX } from "solid-js"

export const IconTimerOffStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 2v4m0-4h-2m2 0h2m-2 4a8 8 0 0 0-6.568 12.568M12 6c1.698 0 3.273.53 4.568 1.432m2.614 3.04a8 8 0 0 1-10.71 10.71m8.096-13.75L22 2m-5.432 5.432L5.432 18.568m0 0L2 22"
				fill="none"
			/>
		</svg>
	)
}

export default IconTimerOffStroke
