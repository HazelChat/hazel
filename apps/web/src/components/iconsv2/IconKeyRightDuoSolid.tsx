// duo-solid/security
import type { Component, JSX } from "solid-js"

export const IconKeyRightDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M18 12h4v3m-4-3h-8m8 0v2"
				opacity=".28"
			/>
			<path fill="currentColor" d="M6 7a5 5 0 1 1 0 10A5 5 0 0 1 6 7Z" />
		</svg>
	)
}

export default IconKeyRightDuoSolid
