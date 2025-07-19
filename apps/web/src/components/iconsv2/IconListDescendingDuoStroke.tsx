// duo-stroke/general
import type { Component, JSX } from "solid-js"

export const IconListDescendingDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 12h9m-9 6h9M12 6h9"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M3 20.5v-2.697c0-1.391.847-2.642 2.139-3.16a.97.97 0 0 1 .722 0A3.4 3.4 0 0 1 8 17.804V20.5m-5-2h5m-5-14 .106-.022a12.2 12.2 0 0 1 4.788 0c.045.01.062.065.03.098L3.13 9.368a.056.056 0 0 0 .051.095 11.8 11.8 0 0 1 4.636 0L8 9.5"
				fill="none"
			/>
		</svg>
	)
}

export default IconListDescendingDuoStroke
