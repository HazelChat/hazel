// solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconChevronBigUp: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M5.19 14.414a1 1 0 0 0 .893 1.582 71 71 0 0 1 11.834 0 1 1 0 0 0 .893-1.582 31.6 31.6 0 0 0-5.669-6.007 1.8 1.8 0 0 0-2.282 0 31.6 31.6 0 0 0-5.67 6.007Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconChevronBigUp
