// stroke/editing
import type { Component, JSX } from "solid-js"

export const IconStrikeThroughStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 12c2.271 0 5 .435 5 3.868 0 5.07-8.67 5.506-9.854 1.132M12 12h9m-9 0H3m4-3.868C7 3.062 15.67 2.626 16.854 7"
				fill="none"
			/>
		</svg>
	)
}

export default IconStrikeThroughStroke
