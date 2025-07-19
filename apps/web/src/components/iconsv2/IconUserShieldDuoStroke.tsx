// duo-stroke/users
import type { Component, JSX } from "solid-js"

export const IconUserShieldDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M11.047 21H6a2 2 0 0 1-2-2 4 4 0 0 1 4-4h2.16"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m14.807 15.135 2.306-.73c.233-.073.486-.073.719 0l2.338.74c.431.137.735.504.773.934l.04.453c.167 1.905-.904 3.714-2.705 4.57l-.284.134a1.19 1.19 0 0 1-1.037-.01l-.327-.163c-1.683-.841-2.705-2.527-2.626-4.331l.027-.618a1.09 1.09 0 0 1 .776-.979Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconUserShieldDuoStroke
