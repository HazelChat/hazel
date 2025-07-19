// contrast/users
import type { Component, JSX } from "solid-js"

export const IconUserArrowUp1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
					d="M13.314 15H7a4 4 0 0 0-4 4 2 2 0 0 0 2 2h11v-1.188a3 3 0 0 1-2.686-4.337z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M22 16.812a15 15 0 0 0-2.556-2.655A.7.7 0 0 0 19 14m-3 2.811a15 15 0 0 1 2.556-2.654A.7.7 0 0 1 19 14m0 0v7m-4 0H6a2 2 0 0 1-2-2 4 4 0 0 1 4-4h4.43M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
			/>
		</svg>
	)
}

export default IconUserArrowUp1
