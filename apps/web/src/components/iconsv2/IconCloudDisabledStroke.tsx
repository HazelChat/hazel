// stroke/development
import type { Component, JSX } from "solid-js"

export const IconCloudDisabledStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M9.702 20H16.5a5.5 5.5 0 0 0 3.186-9.984M6.466 9.08v-.002l.045-.108a6.502 6.502 0 0 1 10.585-2.066M6.466 9.08A6.5 6.5 0 0 0 6.174 13m.29-3.92c-.322.803-.483 1.204-.561 1.325-.152.235-.038.1-.244.29-.106.097-.579.39-1.525.976a4.5 4.5 0 0 0 .344 7.85M17.096 6.904 4.48 19.522M17.096 6.903 20 4M2 22l2.479-2.479"
				fill="none"
			/>
		</svg>
	)
}

export default IconCloudDisabledStroke
