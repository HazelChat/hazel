// stroke/security
import type { Component, JSX } from "solid-js"

export const IconEncryptedLockStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M16 9V7a4 4 0 0 0-8 0v2m-3 4h8m-8 4h6m-6 4h4m7-8h3m-5 4h5m-7 4h7"
				fill="none"
			/>
		</svg>
	)
}

export default IconEncryptedLockStroke
