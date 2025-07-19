// duo-stroke/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconDribbbleDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M8.786 2.528a36 36 0 0 1 3.785 5.485 15.6 15.6 0 0 0 4.537-4.612q.867.518 1.61 1.192a17.6 17.6 0 0 1-5.213 5.199q.506 1.031.948 2.1a17.5 17.5 0 0 1 4.267-.525c1.119 0 2.214.105 3.275.306Q22 11.837 22 12q0 .862-.141 1.685a15.6 15.6 0 0 0-3.14-.318c-1.222 0-2.41.141-3.55.408a36 36 0 0 1 1.675 6.976 10 10 0 0 1-1.912.812 34 34 0 0 0-1.677-7.205 15.55 15.55 0 0 0-7.252 5.645 10 10 0 0 1-1.483-1.366 17.55 17.55 0 0 1 8.016-6.146 34 34 0 0 0-.774-1.711 17.4 17.4 0 0 1-7.731 1.796q-1.025-.001-2.02-.116a10 10 0 0 1 .107-2.001q.94.116 1.913.117c2.442 0 4.75-.565 6.804-1.57A34.2 34.2 0 0 0 6.9 3.397a10 10 0 0 1 1.886-.868Z"
			/>
		</svg>
	)
}

export default IconDribbbleDuoStroke
