// duo-solid/general
import type { Component, JSX } from "solid-js"

export const IconListArrowDownDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				<path fill="currentColor" d="M4 5a1 1 0 0 0 0 2h16a1 1 0 1 0 0-2z" />
				<path fill="currentColor" d="M4 11a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2z" />
				<path fill="currentColor" d="M4 17a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2z" />
			</g>
			<path
				fill="currentColor"
				d="M20 11.5a1 1 0 1 0-2 0v3.9a36 36 0 0 1-1.017-.11q-.422-.05-.882-.1a1 1 0 0 0-.901 1.596 16 16 0 0 0 2.727 2.83 1.7 1.7 0 0 0 2.146 0 16 16 0 0 0 2.727-2.83 1 1 0 0 0-.9-1.595q-.46.048-.883.099c-.35.041-.686.08-1.017.11z"
			/>
		</svg>
	)
}

export default IconListArrowDownDuoSolid
