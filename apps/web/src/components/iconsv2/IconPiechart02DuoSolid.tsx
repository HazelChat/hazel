// duo-solid/chart-&-graph
import type { Component, JSX } from "solid-js"

export const IconPiechart02DuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12.732 2.76c-.62.019-.991.653-.784 1.238L14.1 10.06a.53.53 0 0 0 .26.294l5.901 2.95c.5.25 1.108-.012 1.2-.564q.115-.691.116-1.414a8.57 8.57 0 0 0-8.844-8.566Z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M7.415 2.232c.736-.454 1.66-.044 1.949.77l2.753 7.76c.227.642.694 1.17 1.302 1.473l7.413 3.707c.773.386 1.066 1.351.529 2.027A10.65 10.65 0 0 1 13.005 22C7.11 22 2.331 17.221 2.331 11.326c0-3.846 2.034-7.216 5.084-9.094Z"
			/>
		</svg>
	)
}

export default IconPiechart02DuoSolid
