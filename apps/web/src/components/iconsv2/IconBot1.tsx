// contrast/users
import type { Component, JSX } from "solid-js"

export const IconBot1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M3 14c0-1.861 0-2.792.245-3.545a5 5 0 0 1 3.21-3.21C7.208 7 8.139 7 10 7h4c1.861 0 2.792 0 3.545.245a5 5 0 0 1 3.21 3.21C21 11.208 21 12.139 21 14s0 2.792-.245 3.545a5 5 0 0 1-3.21 3.21C16.792 21 15.861 21 14 21h-4c-1.861 0-2.792 0-3.545-.245a5 5 0 0 1-3.21-3.21C3 16.792 3 15.861 3 14Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 2v5m0 0h-2c-1.861 0-2.792 0-3.545.245a5 5 0 0 0-3.21 3.21C3 11.208 3 12.139 3 14s0 2.792.245 3.545a5 5 0 0 0 3.21 3.21C7.208 21 8.139 21 10 21h4c1.861 0 2.792 0 3.545-.245a5 5 0 0 0 3.21-3.21C21 16.792 21 15.861 21 14s0-2.792-.245-3.545a5 5 0 0 0-3.21-3.21C16.792 7 15.861 7 14 7zm-3 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm6 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"
			/>
		</svg>
	)
}

export default IconBot1
