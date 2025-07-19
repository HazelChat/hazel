// stroke/time
import type { Component, JSX } from "solid-js"

export const IconCalendarSettingsStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M18 18h.01m2.95-8c-.05-.982-.163-1.684-.417-2.296a6 6 0 0 0-3.247-3.247A5 5 0 0 0 16 4.127M20.96 10H3.04m17.92 0c.018.352.028.74.033 1.172M3.04 10C3 10.788 3 11.755 3 13c0 2.796 0 4.194.457 5.296a6 6 0 0 0 3.247 3.247c1.013.42 2.274.454 4.64.457M3.04 10c.05-.982.163-1.684.417-2.296a6 6 0 0 1 3.247-3.247A5 5 0 0 1 8 4.127M8 2v2.128m0 0V6m0-1.872C8.941 4 10.172 4 12 4s3.059 0 4 .128M16 2v2.128m0 0V6m2 8 1.179 1.155 1.65.017.017 1.65L22 18l-1.154 1.179-.018 1.65-1.65.017L18 22l-1.179-1.154-1.65-.018-.016-1.65L14 18l1.155-1.179.017-1.65 1.65-.016z"
				fill="none"
			/>
		</svg>
	)
}

export default IconCalendarSettingsStroke
