// icons/svgs/contrast/automotive

import type React from "react"
import type { SVGProps } from "react"

export const IconAirplaneFlying1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M6.162 16H20a1 1 0 0 0 1-1 3 3 0 0 0-3-3h-3L8.896 5.025A3 3 0 0 0 6.64 4H6l3 8H6l-2.748-1.832A1 1 0 0 0 2.697 10H2l1.316 3.949A3 3 0 0 0 6.162 16Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M3 20h18M6.162 16H20a1 1 0 0 0 1-1 3 3 0 0 0-3-3h-3L8.896 5.025A3 3 0 0 0 6.64 4H6l3 8H6l-2.748-1.832A1 1 0 0 0 2.697 10H2l1.316 3.949A3 3 0 0 0 6.162 16Z"
			/>
		</svg>
	)
}

export default IconAirplaneFlying1
