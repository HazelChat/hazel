// stroke/sports
import type { Component, JSX } from "solid-js"

export const IconBallTennisStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M20.405 8.382a6.003 6.003 0 0 0-2.935 10.954m2.935-10.954a9.13 9.13 0 0 0-6.037-5.22A9.13 9.13 0 0 0 6.53 4.665m13.875 3.717a9.1 9.1 0 0 1 .433 5.986 9.1 9.1 0 0 1-3.368 4.968m0 0a9.13 9.13 0 0 1-7.838 1.502 9.13 9.13 0 0 1-6.037-5.22M6.53 4.665a6.002 6.002 0 0 1-2.935 10.953M6.53 4.665a9.1 9.1 0 0 0-3.368 4.967 9.1 9.1 0 0 0 .433 5.986"
				fill="none"
			/>
		</svg>
	)
}

export default IconBallTennisStroke
