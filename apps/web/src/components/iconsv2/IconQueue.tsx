// solid/general
import type { Component, JSX } from "solid-js"

export const IconQueue: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path d="M6 3a4 4 0 1 0 0 8h12a4 4 0 0 0 0-8z" fill="currentColor" />
			<path d="M3 14a1 1 0 1 0 0 2h18a1 1 0 1 0 0-2z" fill="currentColor" />
			<path d="M3 19a1 1 0 1 0 0 2h18a1 1 0 1 0 0-2z" fill="currentColor" />
		</svg>
	)
}

export default IconQueue
