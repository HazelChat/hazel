// duo-solid/general
import type { Component, JSX } from "solid-js"

export const IconLogInRightDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M9 2a7 7 0 0 0-7 7v6a7 7 0 0 0 11.667 5.217 1 1 0 1 0-1.334-1.49A5 5 0 0 1 4 15V9a5 5 0 0 1 8.333-3.727 1 1 0 1 0 1.334-1.49A6.98 6.98 0 0 0 9 2Z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M11.807 9.1a1 1 0 0 0-1.596-.9 16 16 0 0 0-2.83 2.727 1.7 1.7 0 0 0 0 2.146 16 16 0 0 0 2.83 2.727 1 1 0 0 0 1.595-.9q-.047-.46-.098-.884c-.04-.35-.08-.686-.11-1.016H21a1 1 0 1 0 0-2h-9.401c.029-.33.068-.666.11-1.016q.05-.423.098-.884Z"
			/>
		</svg>
	)
}

export default IconLogInRightDuoSolid
