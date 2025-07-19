// solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowBigTurnLeft: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill-rule="evenodd"
				d="M9.204 4.196a1 1 0 0 1 1.588.92 60 60 0 0 0-.264 2.904c3.39.13 6.178.917 8.175 2.588 2.239 1.873 3.3 4.7 3.3 8.392a1 1 0 0 1-1.8.6c-2.454-3.273-5.595-3.57-9.674-3.597q.096 1.445.264 2.882a1 1 0 0 1-1.588.919 36.3 36.3 0 0 1-6.744-6.485 2.11 2.11 0 0 1 0-2.638 36.3 36.3 0 0 1 6.744-6.485z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconArrowBigTurnLeft
