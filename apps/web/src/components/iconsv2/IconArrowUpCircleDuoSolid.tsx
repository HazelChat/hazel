// duo-solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowUpCircleDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 1.85C6.394 1.85 1.85 6.394 1.85 12S6.394 22.15 12 22.15 22.15 17.606 22.15 12 17.606 1.85 12 1.85Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M8 11.949a20.3 20.3 0 0 1 3.604-3.807A.63.63 0 0 1 12 8m4 3.949a20.3 20.3 0 0 0-3.604-3.807A.63.63 0 0 0 12 8m0 0v8"
			/>
		</svg>
	)
}

export default IconArrowUpCircleDuoSolid
