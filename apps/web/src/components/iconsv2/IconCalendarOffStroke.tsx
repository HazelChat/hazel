// stroke/time
import type { Component, JSX } from "solid-js"

export const IconCalendarOffStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M20.96 10c.04.788.04 1.755.04 3 0 2.796 0 4.194-.457 5.296a6 6 0 0 1-3.247 3.247C16.194 22 14.796 22 12 22c-1.955 0-3.227 0-4.191-.156M20.959 10h-1.307m1.308 0c-.023-.45-.06-.84-.116-1.191M3.04 10C3 10.788 3 11.755 3 13c0 2.796 0 4.194.457 5.296.212.513.492.989.83 1.417M3.04 10c.05-.982.163-1.684.417-2.296a6 6 0 0 1 3.247-3.247A5 5 0 0 1 8 4.127M3.04 10H14M8 2v2.128m0 0V6m0-1.872C8.941 4 10.172 4 12 4s3.059 0 4 .128M16 2v2.128m0 0V6m0-1.872c.498.067.915.17 1.296.329.513.212.989.492 1.417.83M2 22l2.287-2.287m0 0L14 10m0 0 4.713-4.713m0 0L22 2"
				fill="none"
			/>
		</svg>
	)
}

export default IconCalendarOffStroke
