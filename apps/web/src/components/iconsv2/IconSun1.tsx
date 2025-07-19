// contrast/weather
import type { Component, JSX } from "solid-js"

export const IconSun1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g clip-path="url(#icon-gptyl3zrd-a)">
				<path
					fill="currentColor"
					d="M12 18c3.3137 0 6-2.6863 6-6s-2.6863-6-6-6-6 2.6863-6 6 2.6863 6 6 6Z"
					opacity=".28"
				/>
				<path
					stroke="currentColor"
					fill="none"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 23v-1m-7.7782-2.2218.7071-.7071M1 12h1m2.2218-7.7782.7071.7071M12 2V1m7.0711 3.929.7071-.7072M22 12h1m-3.9289 7.0711.7071.7071M18 12c0 3.3137-2.6863 6-6 6s-6-2.6863-6-6 2.6863-6 6-6 6 2.6863 6 6Z"
				/>
			</g>
			<defs>
				<clipPath id="icon-gptyl3zrd-a">
					<path fill="currentColor" d="M0 0h24v24H0z" />
				</clipPath>
			</defs>
		</svg>
	)
}

export default IconSun1
