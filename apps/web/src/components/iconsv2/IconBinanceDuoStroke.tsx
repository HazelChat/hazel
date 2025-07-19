// duo-stroke/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconBinanceDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m3.411 13.718-.341-.342a1.947 1.947 0 0 1 0-2.753l.341-.34m17.177 0 .342.34c.76.76.76 1.993 0 2.753l-.342.341m-3.435 3.436-3.534 3.534a2.29 2.29 0 0 1-3.239 0l-3.533-3.534M17.153 6.847l-3.534-3.534a2.29 2.29 0 0 0-3.239 0L6.847 6.847"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M9.374 12.81a1.145 1.145 0 0 1 0-1.62l1.815-1.815a1.145 1.145 0 0 1 1.62 0l1.814 1.815a1.145 1.145 0 0 1 0 1.62l-1.814 1.814a1.145 1.145 0 0 1-1.62 0z"
				fill="none"
			/>
		</svg>
	)
}

export default IconBinanceDuoStroke
