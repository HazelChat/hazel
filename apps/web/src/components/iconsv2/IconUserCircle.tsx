// solid/users
import type { Component, JSX } from "solid-js"

export const IconUserCircle: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g clip-path="url(#icon-b2vgpenrc-a)">
				<path
					fill="currentColor"
					fill-rule="evenodd"
					d="M.5 12C.5 5.649 5.649.5 12 .5S23.5 5.649 23.5 12a11.47 11.47 0 0 1-3.456 8.219A11.47 11.47 0 0 1 12 23.5a11.47 11.47 0 0 1-8.044-3.281A11.47 11.47 0 0 1 .5 12Zm8 3c-1.634 0-3.098.85-3.886 2.144q.486.696 1.09 1.288A8.97 8.97 0 0 0 12 21c2.45 0 4.671-.978 6.295-2.568a9 9 0 0 0 1.091-1.288C18.598 15.85 17.135 15 15.5 15zm0-5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0Z"
					clip-rule="evenodd"
				/>
			</g>
			<defs>
				<clipPath id="icon-b2vgpenrc-a">
					<path fill="currentColor" d="M0 0h24v24H0z" />
				</clipPath>
			</defs>
		</svg>
	)
}

export default IconUserCircle
