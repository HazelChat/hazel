// contrast/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconExchange011: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path
					fill="currentColor"
					d="M18.574 19.799A14.7 14.7 0 0 0 21 17.352l-.626.062a24 24 0 0 1-4.748 0L15 17.352c.706.905 1.52 1.726 2.426 2.447a.92.92 0 0 0 1.148 0Z"
				/>
				<path
					fill="currentColor"
					d="M5.426 4.201A14.7 14.7 0 0 0 3 6.648l.626-.062a24 24 0 0 1 4.748 0L9 6.648a14.7 14.7 0 0 0-2.426-2.447.92.92 0 0 0-1.148 0Z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M18 17.532V7a3 3 0 1 0-6 0v10a3 3 0 1 1-6 0V6.468m12 11.064q1.19 0 2.374-.118l.626-.062a14.7 14.7 0 0 1-2.426 2.447.92.92 0 0 1-1.148 0A14.7 14.7 0 0 1 15 17.352l.626.062q1.185.117 2.374.118ZM6 6.468a24 24 0 0 0-2.374.118L3 6.648a14.7 14.7 0 0 1 2.426-2.447.92.92 0 0 1 1.148 0C7.48 4.922 8.294 5.743 9 6.648l-.626-.062A24 24 0 0 0 6 6.468Z"
			/>
		</svg>
	)
}

export default IconExchange011
