// duo-stroke/time
import type { Component, JSX } from "solid-js"

export const IconCalendarSettingsDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M20.993 11.172A30 30 0 0 0 20.96 10c-.05-.982-.163-1.684-.417-2.296a6 6 0 0 0-3.247-3.247A5 5 0 0 0 16 4.127C15.059 4 13.828 4 12 4s-3.059 0-4 .128c-.498.067-.915.17-1.296.329a6 6 0 0 0-3.247 3.247C3.203 8.316 3.09 9.018 3.04 10 3 10.788 3 11.755 3 13c0 2.796 0 4.194.457 5.296a6 6 0 0 0 3.247 3.247c1.013.42 2.274.454 4.64.457"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M18 18h.01m2.95-8H3.04M8 2v4m8-4v4m2 8 1.179 1.155 1.65.017.017 1.65L22 18l-1.154 1.179-.018 1.65-1.65.017L18 22l-1.179-1.154-1.65-.018-.016-1.65L14 18l1.155-1.179.017-1.65 1.65-.016z"
				fill="none"
			/>
		</svg>
	)
}

export default IconCalendarSettingsDuoStroke
