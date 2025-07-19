// duo-stroke/devices
import type { Component, JSX } from "solid-js"

export const IconWifiExclamationMarkDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M15 4.78a15.95 15.95 0 0 1 7.806 3.92m-21.613 0A15.95 15.95 0 0 1 9 4.78m-4.268 7.463A11 11 0 0 1 9 9.914m6 0a11 11 0 0 1 4.268 2.329M15 15.303a6 6 0 0 1 .698.472m-7.443.037a6 6 0 0 1 .745-.51"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 19.5h.01M12 4v12"
				fill="none"
			/>
		</svg>
	)
}

export default IconWifiExclamationMarkDuoStroke
