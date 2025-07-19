// solid/general
import type { Component, JSX } from "solid-js"

export const IconLogInLeft: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M15 2c-1.792 0-3.43.675-4.667 1.783a1 1 0 1 0 1.334 1.49A5 5 0 0 1 20 9v6a5 5 0 0 1-8.333 3.727 1 1 0 0 0-1.334 1.49A7 7 0 0 0 22 15V9a7 7 0 0 0-7-7Z"
				fill="currentColor"
			/>
			<path
				d="M13.789 8.2a1 1 0 0 0-1.595.9q.047.46.098.884c.04.35.08.686.11 1.016H3a1 1 0 1 0 0 2h9.401q-.045.493-.11 1.015-.05.424-.098.885a1 1 0 0 0 1.596.9 16 16 0 0 0 2.83-2.727 1.7 1.7 0 0 0 0-2.146A16 16 0 0 0 13.79 8.2Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconLogInLeft
