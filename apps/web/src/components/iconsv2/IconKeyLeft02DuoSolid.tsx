// duo-solid/security
import type { Component, JSX } from "solid-js"

export const IconKeyLeft02DuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill="currentColor"
				fill-rule="evenodd"
				d="M12.468 10c0-.154.036-.307.105-.445a5.5 5.5 0 1 1 0 4.89A1 1 0 0 1 12.47 14h-2.468l-1.146-1.146a.5.5 0 0 0-.708 0L7.001 14h-3l-2-2 2-2z"
				clip-rule="evenodd"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2.2"
				d="M18.501 13v-2a1.25 1.25 0 0 1 0 2Z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M13.001 10h-9l-2 2 2 2h3l1.146-1.146a.5.5 0 0 1 .708 0L10.001 14h3"
			/>
		</svg>
	)
}

export default IconKeyLeft02DuoSolid
