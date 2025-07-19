// duo-stroke/development
import type { Component, JSX } from "solid-js"

export const IconCloudArrowDownloadDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M6.51 6.97a6.502 6.502 0 0 1 11.734-.515c.237.446.355.668.42.756.1.136.067.1.191.215.08.073.305.228.755.537A5.5 5.5 0 0 1 22 12.5c0 1.33-.472 2.55-1.257 3.5M6.51 6.97l-.046.11m.046-.11-.045.108v.002m0 0A6.5 6.5 0 0 0 6 9.5m.465-2.42c-.322.803-.483 1.204-.561 1.325-.152.235-.038.1-.244.29-.106.097-.579.39-1.525.976A4.497 4.497 0 0 0 2.758 16"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M16 17.596a19 19 0 0 1-3.445 3.232.94.94 0 0 1-1.11 0A19 19 0 0 1 8 17.596m4-5.37V21"
				fill="none"
			/>
		</svg>
	)
}

export default IconCloudArrowDownloadDuoStroke
