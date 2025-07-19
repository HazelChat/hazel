// duo-stroke/general
import type { Component, JSX } from "solid-js"

export const IconTranslateDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M3 5h4m0 0h4a8 8 0 0 1-4 6.93M7 5V3m0 8.93A7.96 7.96 0 0 1 3 13m4-1.07A8.04 8.04 0 0 1 4.07 9M7 11.93A7.96 7.96 0 0 0 11 13"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M21 21v-.062c0-.994-.105-1.978-.31-2.938M13 21v-.062c0-.994.105-1.978.31-2.938m0 0a14.1 14.1 0 0 1 2.774-5.855 1.173 1.173 0 0 1 1.832 0A14.1 14.1 0 0 1 20.69 18m-7.38 0h7.38"
				fill="none"
			/>
		</svg>
	)
}

export default IconTranslateDuoStroke
