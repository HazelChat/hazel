// duo-stroke/general
import type { Component, JSX } from "solid-js"

export const IconCheckTickDoubleDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m21.553 7.609-.87.491a26.7 26.7 0 0 0-8.837 8.07l-.428.62-.298-.353"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m2.605 11.781 4.524 5.224.374-.654a26.7 26.7 0 0 1 8.119-8.793l.825-.563"
				fill="none"
			/>
		</svg>
	)
}

export default IconCheckTickDoubleDuoStroke
