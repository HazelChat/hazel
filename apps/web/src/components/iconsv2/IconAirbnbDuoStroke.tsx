// duo-stroke/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconAirbnbDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m12 17.857-1.985 1.985a3.953 3.953 0 0 1-6.373-4.478l3.143-6.683c1.35-2.868 2.024-4.303 2.843-4.904a4 4 0 0 1 4.736-.001c.818.601 1.494 2.035 2.844 4.903l3.148 6.685a3.952 3.952 0 0 1-6.37 4.479zm0 0 2.05-2.05c1.827-1.827.533-4.95-2.05-4.95s-3.877 3.123-2.05 4.95z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M14.05 15.806 12 17.856l-2.05-2.05c-1.827-1.826-.533-4.95 2.05-4.95s3.877 3.124 2.05 4.95Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconAirbnbDuoStroke
