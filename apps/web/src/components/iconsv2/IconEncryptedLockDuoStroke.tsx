// duo-stroke/security
import type { Component, JSX } from "solid-js"

export const IconEncryptedLockDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M5 17h6m5-4h3m-7 8h7"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M16 9V7a4 4 0 0 0-8 0v2m-3 4h8m-8 8h4m5-4h5"
				fill="none"
			/>
		</svg>
	)
}

export default IconEncryptedLockDuoStroke
