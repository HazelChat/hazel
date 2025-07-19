// contrast/weather
import type { Component, JSX } from "solid-js"

export const IconSunriseUp1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M16.004 20.996a5 5 0 1 0-8.012-.007m8.012.007-8.013-.007m8.013.007L21 21m-13.009-.011L3 20.984M9.557 5.29a12.2 12.2 0 0 1 2.082-2.162A.57.57 0 0 1 12 3m2.443 2.29a12.2 12.2 0 0 0-2.082-2.162A.57.57 0 0 0 12 3m0 0v6M2 17h1m18 0h1M4.472 10.422l.753.658m14.31-.658-.754.658"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M16.004 20.996a5 5 0 1 0-8.012-.007z"
				clip-rule="evenodd"
				opacity=".28"
			/>
		</svg>
	)
}

export default IconSunriseUp1
