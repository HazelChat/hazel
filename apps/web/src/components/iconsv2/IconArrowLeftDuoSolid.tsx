// duo-solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowLeftDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M4 12h16"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M3 12c0-.432.144-.864.429-1.22a31.2 31.2 0 0 1 5.807-5.584A1 1 0 0 1 10.83 6v12a1 1 0 0 1-1.594.804 31.2 31.2 0 0 1-5.807-5.584A1.95 1.95 0 0 1 3 12Z"
			/>
		</svg>
	)
}

export default IconArrowLeftDuoSolid
