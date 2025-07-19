// solid/sports
import type { Component, JSX } from "solid-js"

export const IconWhistle: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path d="M11 2a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Z" fill="currentColor" />
			<path
				d="M5.293 4.293a1 1 0 0 1 1.414 0l1 1a1 1 0 0 1-1.414 1.414l-1-1a1 1 0 0 1 0-1.414Z"
				fill="currentColor"
			/>
			<path
				d="M16.707 4.293a1 1 0 0 1 0 1.414l-1 1a1 1 0 1 1-1.414-1.414l1-1a1 1 0 0 1 1.414 0Z"
				fill="currentColor"
			/>
			<path
				d="M2 15.5A6.5 6.5 0 0 1 8.5 9h1.4v2.5a1.1 1.1 0 0 0 2.2 0V9H20a2 2 0 0 1 2 2v1.687a2 2 0 0 1-1.592 1.958l-5.414 1.128A6.5 6.5 0 0 1 2 15.5Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconWhistle
