// solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowLeft: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M10.83 6.05 10.58 11H20a1 1 0 1 1 0 2h-9.419l.248 4.95a1 1 0 0 1-1.593.854 31.2 31.2 0 0 1-5.807-5.584 1.95 1.95 0 0 1 0-2.44 31.2 31.2 0 0 1 5.807-5.584 1 1 0 0 1 1.593.854Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconArrowLeft
