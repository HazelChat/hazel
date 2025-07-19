// duo-stroke/general
import type { Component, JSX } from "solid-js"

export const IconSpotlightDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				clip-path="url(#icon-wtcwqmxr9-a)"
			>
				<path fill="currentColor" d="M4.718 10 9 20.5M9.328 7l12.834 12.673" opacity=".28" />
				<path fill="currentColor" d="M6.614 4.32 5.467 2.68A2 2 0 0 0 2.19 4.975l1.147 1.639z" />
				<path
					fill="currentColor"
					d="M16 22.5c3.866 0 7-1.172 7-2 0-.258-.304-.549-.838-.828C20.979 19.057 18.663 18.5 16 18.5c-3.866 0-7 1.171-7 2 0 .828 3.134 2 7 2Z"
				/>
			</g>
			<defs>
				<clipPath id="icon-wtcwqmxr9-a">
					<path fill="currentColor" d="M0 0h24v24H0z" />
				</clipPath>
			</defs>
		</svg>
	)
}

export default IconSpotlightDuoStroke
