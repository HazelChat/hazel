// icons/svgs/duo-stroke/devices

import type React from "react"
import type { SVGProps } from "react"

export const IconGamingPadDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M22 16.91v-5.243A6.667 6.667 0 0 0 15.333 5H8.667A6.667 6.667 0 0 0 2 11.667v5.243a3.09 3.09 0 0 0 5.854 1.382L8 18a3.62 3.62 0 0 1 3.236-2h1.528c1.37 0 2.623.774 3.236 2l.146.292A3.09 3.09 0 0 0 22 16.91Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M8 13v-2m0 0V9m0 2H6m2 0h2m5.01-2-.01.001M18.01 12l-.01.001"
				fill="none"
			/>
		</svg>
	)
}

export default IconGamingPadDuoStroke
