// duo-solid/automotive
import type { Component, JSX } from "solid-js"

export const IconSteeringWheelDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M21.15 12a9.15 9.15 0 1 0-18.3 0 9.15 9.15 0 0 0 18.3 0Z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M19.886 9.936A16.9 16.9 0 0 0 12 8c-2.846 0-5.53.7-7.887 1.936a8.2 8.2 0 0 0-.2 3.09Q4.204 13 4.5 13a6.5 6.5 0 0 1 6.474 7.086 8.2 8.2 0 0 0 2.052 0 6.5 6.5 0 0 1 7.06-7.06 8.2 8.2 0 0 0-.2-3.09ZM12 10.9a1.1 1.1 0 0 1 1.1 1.1v.01a1.1 1.1 0 0 1-2.2 0V12a1.1 1.1 0 0 1 1.1-1.1Z"
				clip-rule="evenodd"
			/>
		</svg>
	)
}

export default IconSteeringWheelDuoSolid
