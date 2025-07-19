// icons/svgs/duo-stroke/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconSwapHalfarrowVerticalDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M10 3v15m4 3V6"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M6 6.887A20.2 20.2 0 0 1 9.604 3.14.63.63 0 0 1 10 3m8 14.113a20.2 20.2 0 0 1-3.604 3.747A.63.63 0 0 1 14 21"
				fill="none"
			/>
		</svg>
	)
}

export default IconSwapHalfarrowVerticalDuoStroke
