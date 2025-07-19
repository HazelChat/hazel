// contrast/navigation
import type { Component, JSX } from "solid-js"

export const IconEarthGlobeTimezone1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 21.15A9.15 9.15 0 1 1 21.15 12c0 .854-.123 1.685-.353 2.475l.012.01a4.5 4.5 0 1 1-6.325 6.325l-.009-.012A9 9 0 0 1 12 21.15Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M13.919 3.052q.08.464.08.948c0 2.429-1.563 4.52-3.811 5.465a3.12 3.12 0 0 1-.426 2.865 1.742 1.742 0 1 1-2.757 1.27A3.117 3.117 0 0 1 4.38 9.265a6.6 6.6 0 0 1-.917-.563m10.457-5.65a9.15 9.15 0 0 0-10.457 5.65m10.457-5.65A9.15 9.15 0 0 1 21.15 12c0 .861-.118 1.694-.34 2.484M3.461 8.702A9.15 9.15 0 0 0 14.484 20.81M18 16.5v2h1.5m1.308-4.016a4.5 4.5 0 0 0-6.325 6.325m6.325-6.325a4.5 4.5 0 1 1-6.325 6.325"
			/>
		</svg>
	)
}

export default IconEarthGlobeTimezone1
