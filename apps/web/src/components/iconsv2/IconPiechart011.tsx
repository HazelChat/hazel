// contrast/chart-&-graph
import type { Component, JSX } from "solid-js"

export const IconPiechart011: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12.044 10.6V4.27c0-.75.61-1.368 1.351-1.257a9.05 9.05 0 0 1 7.592 7.592c.111.74-.507 1.351-1.256 1.351H13.4c-.75 0-1.357-.607-1.357-1.356Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M20.335 15.574A9.044 9.044 0 1 1 8.426 3.665m3.618.604v6.33c0 .75.607 1.357 1.356 1.357h6.33c.75 0 1.368-.61 1.257-1.351a9.05 9.05 0 0 0-7.591-7.592c-.741-.111-1.352.507-1.352 1.256Z"
			/>
		</svg>
	)
}

export default IconPiechart011
