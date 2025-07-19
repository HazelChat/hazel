// duo-stroke/chart-&-graph
import type { Component, JSX } from "solid-js"

export const IconBarchartDownDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M15 21h2.8c1.12 0 1.68 0 2.108-.218a2 2 0 0 0 .874-.874C21 19.48 21 18.92 21 17.8v.2c0-.932 0-1.398-.152-1.765a2 2 0 0 0-1.083-1.083C19.398 15 18.932 15 18 15s-1.398 0-1.765.152a2 2 0 0 0-1.083 1.083C15 16.602 15 17.068 15 18zm0 0H9v-9c0-.932 0-1.398.152-1.765a2 2 0 0 1 1.083-1.083C10.602 9 11.068 9 12 9s1.398 0 1.765.152a2 2 0 0 1 1.083 1.083C15 10.602 15 11.068 15 12z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M9 6c0-.932 0-1.398-.152-1.765a2 2 0 0 0-1.083-1.083C7.398 3 6.932 3 6 3s-1.398 0-1.765.152a2 2 0 0 0-1.083 1.083C3 4.602 3 5.068 3 6v11.8c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874C4.52 21 5.08 21 6.2 21H9z"
				fill="none"
			/>
		</svg>
	)
}

export default IconBarchartDownDuoStroke
