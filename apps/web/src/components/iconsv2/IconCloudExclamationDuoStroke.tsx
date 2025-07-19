// duo-stroke/development
import type { Component, JSX } from "solid-js"

export const IconCloudExclamationDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M6.51 7.97a6.502 6.502 0 0 1 11.734-.515c.237.446.355.668.42.756.1.136.067.1.191.215.08.073.305.228.755.537A5.5 5.5 0 0 1 16.5 19M6.51 7.97l-.045.11m.046-.11-.045.108v.002m0 0A6.5 6.5 0 0 0 6.174 12m.29-3.92c-.322.803-.483 1.204-.561 1.325-.152.235-.038.1-.244.29-.106.097-.579.39-1.525.976A4.5 4.5 0 0 0 6.5 19"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 17v-6m0 9.01v-.011"
				fill="none"
			/>
		</svg>
	)
}

export default IconCloudExclamationDuoStroke
