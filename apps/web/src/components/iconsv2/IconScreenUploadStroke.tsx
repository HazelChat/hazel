// stroke/devices
import type { Component, JSX } from "solid-js"

export const IconScreenUploadStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				clip-path="url(#a)"
			>
				<path
					d="M14.156 2H4.4c-.84 0-1.26 0-1.581.163a1.5 1.5 0 0 0-.656.656C2 3.139 2 3.559 2 4.4v10.2c0 .84 0 1.26.163 1.581a1.5 1.5 0 0 0 .656.656c.32.163.74.163 1.581.163H12m10-4.52v2.12c0 .84 0 1.26-.163 1.581a1.5 1.5 0 0 1-.656.656c-.32.163-.74.163-1.581.163H12m0 3.875V17m0 3.875c-1.75 0-3.5.375-5 1.125m5-1.125c1.75 0 3.5.375 5 1.125"
					fill="none"
					stroke="currentColor"
				/>
				<path
					d="M23.034 4.812a15 15 0 0 0-2.557-2.655.7.7 0 0 0-.443-.157m-3 2.812a15 15 0 0 1 2.556-2.655.7.7 0 0 1 .444-.157m0 0v7"
					fill="none"
					stroke="currentColor"
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

export default IconScreenUploadStroke
