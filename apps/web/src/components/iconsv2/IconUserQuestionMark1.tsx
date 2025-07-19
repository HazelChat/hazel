// contrast/users
import type { Component, JSX } from "solid-js"

export const IconUserQuestionMark1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
					d="m15.473 18.371-.119-.039A3 3 0 0 1 13.393 15H8a4 4 0 0 0-4 4 2 2 0 0 0 2 2h9.542c.058-.349.177-.678.345-.975a3 3 0 0 1-.414-1.654Z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M14.54 21H6a2 2 0 0 1-2-2 4 4 0 0 1 4-4h4.379m3.971.502a2.249 2.249 0 0 1 4.37.75c0 1.499-2.249 2.248-2.249 2.248m.03 3h.01M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
			/>
		</svg>
	)
}

export default IconUserQuestionMark1
