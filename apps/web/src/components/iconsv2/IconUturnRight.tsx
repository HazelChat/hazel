// solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconUturnRight: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M9 9a4 4 0 0 0 0 8h3a1 1 0 1 1 0 2H9A6 6 0 0 1 9 7h6.183q-.015-.346-.04-.69l-.171-2.32a1 1 0 0 1 1.586-.882 21.8 21.8 0 0 1 4.073 3.856 1.64 1.64 0 0 1 0 2.071 21.8 21.8 0 0 1-4.073 3.856 1 1 0 0 1-1.586-.882l.17-2.32q.027-.345.041-.69z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconUturnRight
