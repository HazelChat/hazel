// solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconChevronSortVertical: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12.925 4.327a1.47 1.47 0 0 0-1.85 0 21.4 21.4 0 0 0-3.88 4.08 1 1 0 0 0 .88 1.59 52.5 52.5 0 0 1 7.85 0 1 1 0 0 0 .88-1.59 21.4 21.4 0 0 0-3.88-4.08Z"
				fill="currentColor"
			/>
			<path
				d="M8.075 14.003a1 1 0 0 0-.88 1.59 21.4 21.4 0 0 0 3.88 4.08 1.47 1.47 0 0 0 1.85 0 21.4 21.4 0 0 0 3.88-4.08 1 1 0 0 0-.88-1.59 52.5 52.5 0 0 1-7.85 0Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconChevronSortVertical
