// duo-solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowDownCircleDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 22.15c5.606 0 10.15-4.544 10.15-10.15S17.606 1.85 12 1.85 1.85 6.394 1.85 12c0 5.605 4.544 10.15 10.15 10.15Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M16 12.051a20.3 20.3 0 0 1-3.604 3.807A.63.63 0 0 1 12 16m-4-3.949a20.3 20.3 0 0 0 3.604 3.807A.63.63 0 0 0 12 16m0 0V8"
			/>
		</svg>
	)
}

export default IconArrowDownCircleDuoSolid
