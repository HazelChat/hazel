// solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconChevronSortHorizontal: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M4.327 11.075a1.47 1.47 0 0 0 0 1.85 21.4 21.4 0 0 0 4.08 3.88 1 1 0 0 0 1.59-.88 52.5 52.5 0 0 1 0-7.85 1 1 0 0 0-1.59-.88 21.4 21.4 0 0 0-4.08 3.88Z"
				fill="currentColor"
			/>
			<path
				d="M14.003 15.925a1 1 0 0 0 1.59.88 21.4 21.4 0 0 0 4.08-3.88 1.47 1.47 0 0 0 0-1.85 21.4 21.4 0 0 0-4.08-3.88 1 1 0 0 0-1.59.88 52.5 52.5 0 0 1 0 7.85Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconChevronSortHorizontal
