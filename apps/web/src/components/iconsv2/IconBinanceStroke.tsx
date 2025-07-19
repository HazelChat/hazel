// stroke/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconBinanceStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m3.411 13.718-.34-.341a1.947 1.947 0 0 1 0-2.754l.34-.34m17.178 0 .34.34c.761.76.761 1.993 0 2.754l-.34.34m-3.436 3.436-3.533 3.534a2.29 2.29 0 0 1-3.24 0l-3.533-3.534M17.153 6.847 13.62 3.313a2.29 2.29 0 0 0-3.24 0L6.848 6.847m5.962 7.777 1.815-1.814a1.145 1.145 0 0 0 0-1.62L12.81 9.376a1.145 1.145 0 0 0-1.62 0L9.374 11.19a1.145 1.145 0 0 0 0 1.62l1.815 1.815a1.145 1.145 0 0 0 1.62 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconBinanceStroke
