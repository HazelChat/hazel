// contrast/users
import type { Component, JSX } from "solid-js"

export const IconUserArrowRight1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path fill="currentColor" d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
				<path
					fill="currentColor"
					d="M4 19a4 4 0 0 1 4-4h4.912v.846A3 3 0 0 0 12 18c0 .845.35 1.608.912 2.154V21H6a2 2 0 0 1-2-2Z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12.4 21H6a2 2 0 0 1-2-2 4 4 0 0 1 4-4h4.4m6.789 6a15 15 0 0 0 2.654-2.556A.7.7 0 0 0 22 18m-2.811-3c.986.74 1.878 1.599 2.654 2.556.105.13.157.287.157.444m0 0h-7m1-11a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
			/>
		</svg>
	)
}

export default IconUserArrowRight1
