// stroke/security
import type { Component, JSX } from "solid-js"

export const IconShieldPlusStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12.132 15v-3m0 0V9m0 3h-3m3 0h3m-4.25-9.632L5.496 4.313a3 3 0 0 0-1.98 2.707l-.127 3.308a11 11 0 0 0 5.543 9.979l1.521.867a3 3 0 0 0 2.915.032l1.489-.807a11 11 0 0 0 5.728-10.516l-.227-2.95a3 3 0 0 0-1.972-2.592L12.92 2.368a3 3 0 0 0-2.038 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconShieldPlusStroke
