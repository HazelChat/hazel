// duo-solid/chart-&-graph
import type { Component, JSX } from "solid-js"

export const IconTrendlineUpDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m2 17.852.73-.938a21.8 21.8 0 0 1 6.61-5.663.696.696 0 0 1 .916.222l3.212 4.818a.64.64 0 0 0 .926.15 20 20 0 0 0 4.848-5.451"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M22.512 13.684a1 1 0 0 0 .479-.978 18.3 18.3 0 0 0-1.188-4.632 1.476 1.476 0 0 0-1.578-.911 18.3 18.3 0 0 0-4.606 1.287 1 1 0 0 0-.03 1.826l1.274.595a22.7 22.7 0 0 1 3.41 1.968l1.152.806a1 1 0 0 0 1.087.039Z"
				clip-rule="evenodd"
			/>
		</svg>
	)
}

export default IconTrendlineUpDuoSolid
