// duo-stroke/chart-&-graph
import type { Component, JSX } from "solid-js"

export const IconGraphChartCandlestickDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M21 21H7a4 4 0 0 1-4-4V3"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M9 6v3m0 8v-2m8-12v2m0 12v-6m-8 4c-.465 0-.697 0-.888-.051a1.5 1.5 0 0 1-1.06-1.06C7 13.697 7 13.464 7 13v-2c0-.465 0-.697.051-.888a1.5 1.5 0 0 1 1.06-1.06C8.304 9 8.536 9 9 9m0 6c.465 0 .697 0 .888-.051a1.5 1.5 0 0 0 1.06-1.06C11 13.697 11 13.464 11 13v-2c0-.465 0-.697-.051-.888a1.5 1.5 0 0 0-1.06-1.06C9.696 9 9.464 9 9 9m8 2c-.465 0-.698 0-.888-.051a1.5 1.5 0 0 1-1.06-1.06C15 9.696 15 9.464 15 9V7c0-.465 0-.697.051-.888a1.5 1.5 0 0 1 1.06-1.06C16.303 5 16.536 5 17 5m0 6c.465 0 .698 0 .888-.051a1.5 1.5 0 0 0 1.06-1.06C19 9.696 19 9.464 19 9V7c0-.465 0-.697-.051-.888a1.5 1.5 0 0 0-1.06-1.06C17.697 5 17.464 5 17 5"
				fill="none"
			/>
		</svg>
	)
}

export default IconGraphChartCandlestickDuoStroke
