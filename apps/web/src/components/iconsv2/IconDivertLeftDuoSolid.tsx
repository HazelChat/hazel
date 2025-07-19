// duo-solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconDivertLeftDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m22 9-6.879 6.879a3 3 0 0 1-4.242 0L5.5 10.5"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M9.165 7.302a21.8 21.8 0 0 0-5.604-.21A1.625 1.625 0 0 0 2.09 8.56c-.172 1.858-.1 3.742.211 5.604a1 1 0 0 0 1.767.46l.88-1.1A23 23 0 0 1 8.527 9.95l1.1-.88a1 1 0 0 0-.46-1.768Z"
			/>
		</svg>
	)
}

export default IconDivertLeftDuoSolid
