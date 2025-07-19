// solid/editing
import type { Component, JSX } from "solid-js"

export const IconTextQuotesClose: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M5.425 16.88a8.45 8.45 0 0 0 2.64-3.023Q7.555 13.998 7 14a4 4 0 1 1 4-4c0 3.521-1.75 6.634-4.424 8.516a1 1 0 0 1-1.151-1.636Zm10 0a8.45 8.45 0 0 0 2.64-3.023q-.51.141-1.065.143a4 4 0 1 1 4-4c0 3.521-1.75 6.634-4.424 8.516a1 1 0 1 1-1.151-1.636Z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconTextQuotesClose
