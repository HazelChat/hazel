// icons/svgs/duo-stroke/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconSwapHalfarrowHorizontalDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M3 14h15m3-4H6"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M6.887 18a20.2 20.2 0 0 1-3.747-3.604A.63.63 0 0 1 3 14m14.113-8a20.2 20.2 0 0 1 3.747 3.604c.093.116.14.256.14.396"
				fill="none"
			/>
		</svg>
	)
}

export default IconSwapHalfarrowHorizontalDuoStroke
