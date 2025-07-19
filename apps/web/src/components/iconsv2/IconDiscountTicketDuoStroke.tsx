// duo-stroke/general
import type { Component, JSX } from "solid-js"

export const IconDiscountTicketDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M8.818 14.364 15.182 8m-6.114.25h.01m5.854 5.864h.01M9.318 8.25a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0Zm5.864 5.864a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M20 20.932V8.4c0-2.24 0-3.36-.436-4.216a4 4 0 0 0-1.748-1.748C16.96 2 15.84 2 13.6 2h-3.2c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748C4 5.04 4 6.16 4 8.4v12.532c0 .208 0 .311.021.366a.31.31 0 0 0 .43.163c.052-.027.12-.104.258-.259L4.89 21c.26-.292.39-.438.513-.54a2 2 0 0 1 2.529 0c.124.102.254.248.513.54.13.146.195.219.257.27a1 1 0 0 0 1.265 0c.062-.051.126-.124.256-.27.26-.292.39-.438.514-.54a2 2 0 0 1 2.528 0c.124.102.254.248.514.54.13.146.194.219.256.27a1 1 0 0 0 1.265 0 3 3 0 0 0 .257-.27c.259-.292.389-.438.513-.54a2 2 0 0 1 2.529 0c.124.102.254.248.513.54l.18.202c.137.155.206.232.258.259a.31.31 0 0 0 .43-.163c.021-.055.021-.158.021-.366Z"
				opacity=".28"
				fill="none"
			/>
		</svg>
	)
}

export default IconDiscountTicketDuoStroke
