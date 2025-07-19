// duo-solid/general
import type { Component, JSX } from "solid-js"

export const IconGridDashboard03DuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				<path
					fill="currentColor"
					d="M6.5 2a4.5 4.5 0 0 0 0 9H10a1 1 0 0 0 1-1V6.5A4.5 4.5 0 0 0 6.5 2Z"
				/>
				<path fill="currentColor" d="M14 13a1 1 0 0 0-1 1v3.5a4.5 4.5 0 1 0 4.5-4.5z" />
			</g>
			<path
				fill="currentColor"
				d="M17.5 2A4.5 4.5 0 0 0 13 6.5V10a1 1 0 0 0 1 1h3.5a4.5 4.5 0 1 0 0-9Z"
			/>
			<path fill="currentColor" d="M6.5 13a4.5 4.5 0 1 0 4.5 4.5V14a1 1 0 0 0-1-1z" />
		</svg>
	)
}

export default IconGridDashboard03DuoSolid
