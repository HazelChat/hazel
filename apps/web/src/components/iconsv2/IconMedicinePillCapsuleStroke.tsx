// stroke/medical
import type { Component, JSX } from "solid-js"

export const IconMedicinePillCapsuleStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M8.286 8.287 4.222 12.35a5.252 5.252 0 0 0 7.427 7.427l4.065-4.064M8.286 8.287l4.065-4.065a5.252 5.252 0 0 1 7.427 7.427l-4.064 4.065M8.286 8.287l7.428 7.427M13.408 8.47l1.768-1.767a1.5 1.5 0 0 1 1.707-.294"
				fill="none"
			/>
		</svg>
	)
}

export default IconMedicinePillCapsuleStroke
