// duo-stroke/devices
import type { Component, JSX } from "solid-js"

export const IconScreenUploadDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				clip-path="url(#icon-07fzgq8p5-a)"
			>
				<path
					fill="currentColor"
					d="M14.156 2H4.4c-.84 0-1.26 0-1.581.163a1.5 1.5 0 0 0-.656.656C2 3.139 2 3.559 2 4.4v10.2c0 .84 0 1.26.163 1.581a1.5 1.5 0 0 0 .656.656c.32.163.74.163 1.581.163h15.2c.84 0 1.26 0 1.581-.163a1.5 1.5 0 0 0 .656-.656c.163-.32.163-.74.163-1.581v-2.12"
				/>
				<path
					fill="currentColor"
					d="M23.034 4.812a15 15 0 0 0-2.557-2.655.7.7 0 0 0-.443-.157m-3 2.812a15 15 0 0 1 2.556-2.655.7.7 0 0 1 .444-.157m0 0v7"
				/>
				<path
					fill="currentColor"
					d="M12 20.875V17m0 3.875c-1.75 0-3.5.375-5 1.125m5-1.125c1.75 0 3.5.375 5 1.125"
					opacity=".28"
				/>
			</g>
			<defs>
				<clipPath id="icon-07fzgq8p5-a">
					<path fill="currentColor" d="M0 0h24v24H0z" />
				</clipPath>
			</defs>
		</svg>
	)
}

export default IconScreenUploadDuoStroke
