// duo-solid/chart-&-graph
import type { Component, JSX } from "solid-js"

export const IconGraphChartRadarDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill-rule="evenodd"
				d="M14.41 2.807a4.1 4.1 0 0 0-4.82 0L3.4 7.305a4.1 4.1 0 0 0-1.49 4.584l2.365 7.278A4.1 4.1 0 0 0 8.174 22h7.652a4.1 4.1 0 0 0 3.9-2.833l2.364-7.278a4.1 4.1 0 0 0-1.49-4.584z"
				clip-rule="evenodd"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M13 3.001a1 1 0 1 0-2 0v5.416l-2.892 1.777-4.952-1.547a1 1 0 0 0-.597 1.909l4.99 1.56 1.47 2.804-3.506 4.92A1 1 0 0 0 7.143 21l3.406-4.782 4.044 1.603L16.858 21a1 1 0 0 0 1.629-1.16l-2.221-3.118.426-4.682 4.749-1.484a1 1 0 0 0-.597-1.91l-4.952 1.548L13 8.417z"
				clip-rule="evenodd"
			/>
		</svg>
	)
}

export default IconGraphChartRadarDuoSolid
