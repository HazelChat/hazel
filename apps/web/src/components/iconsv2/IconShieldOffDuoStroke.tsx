// duo-stroke/security
import type { Component, JSX } from "solid-js"

export const IconShieldOffDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M6.057 17.943a11 11 0 0 1-2.668-7.615l.127-3.308a3 3 0 0 1 1.98-2.706l5.387-1.946a3 3 0 0 1 2.038 0l5.465 1.974c.3.108.576.262.82.451m1.322 4.343.057.748A11 11 0 0 1 14.857 20.4l-1.49.806a3 3 0 0 1-2.914-.032l-1.25-.713"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M22 2 2 22"
				fill="none"
			/>
		</svg>
	)
}

export default IconShieldOffDuoStroke
