// duo-solid/navigation
import type { Component, JSX } from "solid-js"

export const IconMagneticCompassDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 1.85C6.394 1.85 1.85 6.394 1.85 12S6.394 22.15 12 22.15c5.605 0 10.15-4.544 10.15-10.15S17.605 1.85 12 1.85Z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M16.246 9.635a1.77 1.77 0 0 0-1.881-1.881 7.08 7.08 0 0 0-6.611 6.61 1.77 1.77 0 0 0 1.882 1.882 7.08 7.08 0 0 0 6.61-6.61Z"
			/>
		</svg>
	)
}

export default IconMagneticCompassDuoSolid
