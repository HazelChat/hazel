// duo-solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowBigTurnLeftDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill="currentColor"
				fill-rule="evenodd"
				d="M9.468 8c3.801 0 6.982.492 9.204 2.209 2.291 1.768 3.331 4.64 3.331 8.791a1 1 0 0 1-1.8.6C17.54 16.05 14.068 16 9.468 16a1 1 0 0 1-.999-.95q-.15-3.05 0-6.1a1 1 0 0 1 1-.95Z"
				clip-rule="evenodd"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M9.203 4.196a1 1 0 0 1 1.59.92 59.8 59.8 0 0 0 0 13.769 1 1 0 0 1-1.589.919 36.3 36.3 0 0 1-6.744-6.485 2.11 2.11 0 0 1 0-2.638 36.3 36.3 0 0 1 6.744-6.485z"
				clip-rule="evenodd"
			/>
		</svg>
	)
}

export default IconArrowBigTurnLeftDuoSolid
