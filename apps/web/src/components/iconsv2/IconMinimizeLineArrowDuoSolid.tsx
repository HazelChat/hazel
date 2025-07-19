// duo-solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconMinimizeLineArrowDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M15.573 8.427 20 4M8.427 15.573 4 20"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M13.503 4.947a1 1 0 0 0-1.744.484 21.7 21.7 0 0 0-.225 5.568c.034.38.197.727.455.99a1.62 1.62 0 0 0-.99-.455 21.7 21.7 0 0 0-5.568.224 1 1 0 0 0-.484 1.745l1.66 1.425a23 23 0 0 1 2.465 2.465l1.425 1.66a1 1 0 0 0 1.744-.484c.315-1.851.39-3.723.225-5.568a1.62 1.62 0 0 0-.455-.99c.263.258.61.421.99.455a21.7 21.7 0 0 0 5.568-.225 1 1 0 0 0 .484-1.744l-1.66-1.425a23 23 0 0 1-2.465-2.466z"
			/>
		</svg>
	)
}

export default IconMinimizeLineArrowDuoSolid
