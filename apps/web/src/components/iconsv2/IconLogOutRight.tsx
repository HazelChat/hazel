// solid/general
import type { Component, JSX } from "solid-js"

export const IconLogOutRight: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M9 2a7 7 0 0 0-7 7v6a7 7 0 0 0 11.667 5.217 1 1 0 1 0-1.334-1.49A5 5 0 0 1 4 15V9a5 5 0 0 1 8.333-3.727 1 1 0 1 0 1.334-1.49A6.98 6.98 0 0 0 9 2Z"
				fill="currentColor"
			/>
			<path
				d="M18.789 8.2a1 1 0 0 0-1.596.9q.048.46.099.884c.04.35.08.686.11 1.016H8a1 1 0 1 0 0 2h9.401q-.045.493-.11 1.015-.05.424-.098.885a1 1 0 0 0 1.595.9 16 16 0 0 0 2.831-2.727 1.7 1.7 0 0 0 0-2.146A16 16 0 0 0 18.79 8.2Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconLogOutRight
