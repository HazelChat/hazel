// contrast/food
import type { Component, JSX } from "solid-js"

export const IconWineGlassFilled1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 13c3.402 0 5.733-2.444 5.978-5.562C15.942 8.31 14.191 8.966 12 8c-2.12-.934-3.834-.357-5.812.49C6.82 11.09 8.991 13 12 13Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 13v9m0-9c3.403 0 5.733-2.444 5.979-5.562M12 13c-3.009 0-5.18-1.911-5.811-4.51M12 22h4m-4 0H8m9.979-14.562a7 7 0 0 0 .021-.55A10 10 0 0 0 16.698 2H7.302A10 10 0 0 0 6 6.889c0 .554.065 1.091.189 1.602m11.79-1.053C15.943 8.31 14.19 8.966 12 8c-2.12-.934-3.834-.357-5.811.49"
			/>
		</svg>
	)
}

export default IconWineGlassFilled1
