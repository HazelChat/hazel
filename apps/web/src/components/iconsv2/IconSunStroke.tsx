// stroke/weather
import type { Component, JSX } from "solid-js"

export const IconSunStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g clip-path="url(#a)">
				<path
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 23v-1m-7.778-2.222.707-.707M1 12h1m2.222-7.778.707.707M12 2V1m7.071 3.929.707-.707M22 12h1m-3.929 7.071.707.707M18 12a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z"
					fill="none"
				/>
			</g>
			<defs>
				<clipPath id="a">
					<path fill="currentColor" d="M0 0h24v24H0z" stroke="currentColor" />
				</clipPath>
			</defs>
		</svg>
	)
}

export default IconSunStroke
