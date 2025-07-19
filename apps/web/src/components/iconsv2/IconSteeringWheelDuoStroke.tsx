// duo-stroke/automotive
import type { Component, JSX } from "solid-js"

export const IconSteeringWheelDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
			<path fill="currentColor" d="M13.1 12a1.1 1.1 0 0 0-2.2 0v.01a1.1 1.1 0 1 0 2.2 0z" />
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M19.85 9.805A17 17 0 0 0 12 7.9c-2.83 0-5.5.688-7.851 1.905a8.2 8.2 0 0 0-.222 3.32q.283-.024.573-.025a6.4 6.4 0 0 1 6.374 6.973 8.2 8.2 0 0 0 2.25 0 6.4 6.4 0 0 1 6.948-6.948 8.2 8.2 0 0 0-.221-3.32ZM12 15.29a8.62 8.62 0 0 0-5.479-4.15A14.9 14.9 0 0 1 12 10.1c1.935 0 3.783.369 5.478 1.039A8.62 8.62 0 0 0 12 15.289Z"
				clip-rule="evenodd"
			/>
		</svg>
	)
}

export default IconSteeringWheelDuoStroke
