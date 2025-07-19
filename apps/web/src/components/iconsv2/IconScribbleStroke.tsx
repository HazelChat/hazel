// stroke/editing
import type { Component, JSX } from "solid-js"

export const IconScribbleStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M3 10.294C6.588 7.09 12.05 4.307 17.514 3.03c1.118-.261 1.753 1.234.789 1.858-3.946 2.55-8.186 5.744-11.089 9.453-.352.338.061.903.49.67 3.588-1.944 7.48-4.187 11.694-3.926.543.034.7.76.218 1.014-3.495 1.726-6.256 3.63-8.45 6.17-.718.636-.026 1.794.873 1.462 1.802-.713 6.623-3.832 7.82-.878"
				fill="none"
			/>
		</svg>
	)
}

export default IconScribbleStroke
