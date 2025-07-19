// icons/svgs/duo-stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconPlanetRingDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M19.859 6.66c1.596-.421 2.651-.47 2.862-.052.496.987-3.901 4.201-9.822 7.179s-11.123 4.592-11.62 3.605c-.21-.418.458-1.236 1.748-2.266"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0Z"
				opacity=".28"
				fill="none"
			/>
		</svg>
	)
}

export default IconPlanetRingDuoStroke
