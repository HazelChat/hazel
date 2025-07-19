// duo-stroke/development
import type { Component, JSX } from "solid-js"

export const IconPriorityTrivialDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M11.307 19.84c-2.052-1.074-3.916-2.296-5.556-3.645A2.02 2.02 0 0 1 5 14.631V4c1.815 1.603 3.935 3.043 6.307 4.285.203.106.448.16.693.16s.49-.054.693-.16C15.065 7.043 17.185 5.603 19 4v10.631c0 .592-.262 1.162-.75 1.564-1.641 1.349-3.505 2.571-5.557 3.645-.203.107-.448.16-.693.16s-.49-.053-.693-.16Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M5.2 15.5c.126.26.311.498.55.695 1.641 1.349 3.505 2.571 5.557 3.645.203.107.448.16.693.16s.49-.053.694-.16c2.051-1.074 3.915-2.296 5.556-3.645a2.1 2.1 0 0 0 .55-.695"
				fill="none"
			/>
		</svg>
	)
}

export default IconPriorityTrivialDuoStroke
