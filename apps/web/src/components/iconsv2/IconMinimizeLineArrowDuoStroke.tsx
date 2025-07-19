// duo-stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconMinimizeLineArrowDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12.707 11.293 20 4m-8.707 8.707L4 20"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12.744 5.599a20.7 20.7 0 0 0-.214 5.31.616.616 0 0 0 .56.561c1.759.158 3.544.086 5.311-.215m-7.145 7.146c.3-1.767.372-3.552.214-5.31a.616.616 0 0 0-.56-.561 20.7 20.7 0 0 0-5.311.214"
				fill="none"
			/>
		</svg>
	)
}

export default IconMinimizeLineArrowDuoStroke
